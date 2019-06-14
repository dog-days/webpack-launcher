## 0.6.0(2019-06-14)

### Bug Fix

- fix: the dll path problem in windows platform
- fix: the mock bug with the same api path which only work for the first one

### Update

nothing

### New Function

- feature: add log for mock request
- feature: add baseURL,options.isSinglePage for user custom

## 0.5.3(2019-04-11)

### Bug Fix

- fix the servePath of webpack launcher config invalidation problem

### Update

nothing

### New Function

nothing

## 0.5.2(2019-03-21)

### Bug Fix

- fix the ejected files not containing the dll feature problem

### Update

nothing

### New Function

nothing

## 0.5.1(2019-03-21)

### Bug Fix

- fix the serve-build.js not exits error（npm run eject）

### Update

nothing

### New Function

nothing

## 0.5.0(2019-03-18)

### Bug Fix

nothing

### Update

nothing

### New Function

- building will not copy the .gitignore file

## 0.4.0(2019-03-05)

### Bug Fix

- Resolve the case where the build command also executes the dll without the dll configuration

### Update

nothing

### New Function

- change the package version source for dll building
- update eject.js with webpack.dll.config.js ejected
- add webpack launcher config splitChunks and runtimeChunk

## 0.3.0(2019-03-05)

### Bug Fix

nothing

### Update

nothing

### New Function

- change the public folder copied way while building  
  the dll directory in the public directory does not need to copy the json file such as the manifest.(build a web app)
- add webpack dll custom feature
- add webpackLauncherConfig proxy 和 useMockServer dynamic loading feature

## 0.2.0(2019-03-01)

### Bug Fix

- fix the proxy different place with webpack proxy

### Update

nothing

### New Function

nothing

## 0.1.1(2019-02-20)

### Bug Fix

- fix the no reponse of post request in the proxy request
- fix the proxy different place with webpack proxy

### Update

nothing

### New Function

- add the useMockServer webpack launcher setting

## 0.1.0(2019-02-20)

### Bug Fix

nothing

### Update

nothing

### New Function

- add javascriptEnabled true as the default option

## 0.0.4(2019-01-01)

### Bug Fix

- Fix decorators not work problem, use the legacy stage 1

### Update

nothing

### New Function

nothing

## 0.0.3(2018-12-24)

### Bug Fix

- [Fix the mock router problem which is inconsistent with express](https://github.com/dog-days/webpack-launcher/commit/c75b2054a96a0dc09029484aba1a096209001cf9)

### Update

- [Version repository could be an object.](https://github.com/dog-days/webpack-launcher/commit/745cb989b31cb7e2e204e1e2faf19f8d366c3240)
- [Update instruction message](https://github.com/dog-days/webpack-launcher/commit/e15e56da203bc0c2e62a0deacbfdf6299bbc61f5)

### New Function

nothing
