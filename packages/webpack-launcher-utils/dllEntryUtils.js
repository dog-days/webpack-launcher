const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const getVersionByPackageName = require('./getVersionByPackageName');

const utils = {
  shouldBuildDll(dllEntry, appDllBuild) {
    if (utils.shouldNotBuildDllWithNoPacakge(dllEntry)) {
      return false;
    }

    const prevPackageVersionInfoPath = path.resolve(appDllBuild, utils.savedPackageVersionFileName);

    if (!fs.existsSync(prevPackageVersionInfoPath)) {
      // dll-entry-pacakge-verson-info.json 文件被删除
      return true;
    }

    const currentPackageVersionInfo = utils.getDllEntryPackageVersionInfo(dllEntry);
    const prevPackageVersionInfo = require(prevPackageVersionInfoPath);

    const shouldBuildDll = !_.isEqual(currentPackageVersionInfo, prevPackageVersionInfo);
    const isDllFileIsExists = utils.isAllDllFilesExists(dllEntry, appDllBuild);
    const isDllManifestIsExists = utils.isAllDllManifestFilesExists(dllEntry, appDllBuild);

    // package 版本文件不一致 或者 dll 文件被被删除 或者 dll manifest 文件被删除，
    // 同时 dllEntry 必须有配置，才需要 build dll。
    return shouldBuildDll || !isDllFileIsExists || !isDllManifestIsExists;
  },
  /**
   * 当无 dllEntry pacakge 时不应该构建 dll
   * @param {Object} dllEntry webpackLauncherConfig.dllEntry
   * @return {Boolean} true or false
   */
  shouldNotBuildDllWithNoPacakge(dllEntry) {
    if (dllEntry === undefined) {
      // webpackLauncherConfig.dllEntry 类型已经是验证过的了
      //如果没设置 dllEntry，直接返回
      return true;
    }

    let isDllEntryEmpty = true;

    for (const key in dllEntry) {
      // webpackLauncherConfig.dllEntry[key] 类型已经是验证过的了
      if (dllEntry[key][0]) {
        isDllEntryEmpty = false;
        break;
      }
    }

    if (isDllEntryEmpty) {
      return true;
    }

    return false;
  },
  /**
   * 获取 dllEntry 各个 package version信息
   * 用作对比是否应该更新相关 dll 文件
   * @param {Object} dllEntry webpackLauncherConfig.dllEntry
   * @return {Object} 跟 package.json dependecies 结构一样
   */
  getDllEntryPackageVersionInfo(dllEntry) {
    const dllEntryWithVersion = {};

    for (const key in dllEntry) {
      const entry = dllEntry[key];
      if (!dllEntryWithVersion[key]) {
        dllEntryWithVersion[key] = {};
      }

      entry.forEach(packageName => {
        const version = getVersionByPackageName(packageName);
        dllEntryWithVersion[key][packageName] = version;
      });
    }

    return dllEntryWithVersion;
  },
  savedPackageVersionFileName: 'dll-entry-pacakge-verson-info.json',
  /**
   * 保存 dllEntry 版本信息到 dll-entry-pacakge-verson-info.json 文件中
   * @param {String} savePath
   * @param {Object} dllEntryWithVersion
   */
  writeDllEntryPacakgeVersionFile(savePath, dllEntryWithVersion) {
    fs.writeFileSync(
      path.resolve(savePath, utils.savedPackageVersionFileName),
      JSON.stringify(dllEntryWithVersion, null, 2)
    );
  },
  /**
   * 获取 dll 生成的 js 文件名列表
   * @param {Object} dllEntry webpackLauncherConfig.dllEntry
   * @param {Object} appDllBuild webpackLauncherConfig.appDllBuild
   * @return {Array} 返回 dll 文件名列表
   */
  getAllDllFilesName(dllEntry, appDllBuild) {
    const names = [];

    for (const key in dllEntry) {
      const filePath = path.resolve(appDllBuild, `${key}-manifest.json`);
      if (fs.existsSync(filePath)) {
        // require 有缓存，新生成的 json 文件没更新
        delete require.cache[filePath];
        const mainifest = require(filePath);
        names.push(mainifest.name.replace(/_/g, '.') + '.js');
      }
    }

    return names;
  },
  /**
   *  dll 构建生成的 manifest 文件是否存在
   * @param {Object} dllEntry webpackLauncherConfig.dllEntry
   * @param {Object} appDllBuild webpackLauncherConfig.appDllBuild
   * @return {Boolean} true or false，只要有一个不存在都返回 false
   */
  isAllDllManifestFilesExists(dllEntry, appDllBuild) {
    let isExits = true;

    for (const key in dllEntry) {
      const filePath = path.resolve(appDllBuild, `${key}-manifest.json`);
      if (!fs.existsSync(filePath)) {
        isExits = false;
      }
    }

    return isExits;
  },
  /**
   *  dll 构建生成的 dll 文件是否存在
   * @param {Object} dllEntry webpackLauncherConfig.dllEntry
   * @param {Object} appDllBuild webpackLauncherConfig.appDllBuild
   * @return {Boolean} true or false，只要有一个不存在都返回 false
   */
  isAllDllFilesExists(dllEntry, appDllBuild) {
    const dllFilesName = utils.getAllDllFilesName(dllEntry, appDllBuild);
    let isExits = true;

    dllFilesName.forEach(file => {
      if (!fs.existsSync(path.resolve(appDllBuild, file))) {
        isExits = false;
      }
    });

    return isExits;
  },
  /**
   * 创建 <script></script> 标签
   * @param {Object} webpackLauncherConfig
   * @return {String} 一个或者多个 script 标签
   */
  createDllScripts({ dllEntry, appPublic, appDllBuild, servedPath }) {
    let scripts = '';
    const dllFilesName = utils.getAllDllFilesName(dllEntry, appDllBuild);

    dllFilesName.forEach(fileName => {
      const scriptUrl = path.resolve(
        process.env.NODE_ENV === 'production' ? servedPath : '/',
        appDllBuild.replace(appPublic, '').slice(1),
        fileName
      );

      scripts += `<script type="text/javascript" src="${scriptUrl}"></script>\r\n`;
    });
    return scripts;
  },
};

module.exports = utils;
