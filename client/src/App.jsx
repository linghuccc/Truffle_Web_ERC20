import Header from "./components/1_Header";
import Content from "./components/2_Content";
import Footer from "./components/3_Footer";
import "./css/App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <Header />
      </header>
      <div className="content">
        <Content />
      </div>
      <footer className="footer">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
