import Header from "./components/1_Header";
import Content from "./components/2_Content";
import Footer from "./components/3_Footer";
import "./css/App.css";

function App() {
  return (
    <div className="App">
      <header className="Header">
        <Header />
      </header>
      <div className="Content">
        <Content />
      </div>
      <footer className="Footer">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
