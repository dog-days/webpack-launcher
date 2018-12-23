import './app.css';

class App {
  render(id) {
    document.getElementById(id).innerHTML = this.html();
  }
  html() {
    return `
      <div>
        <header class="App-header">
          <p>
            Edit <code>src/App.js</code>
            and save to reload.
          </p>
        </header>
      </div>
    `;
  }
}

export function render(id) {
  const app = new App();
  app.render(id);
}
