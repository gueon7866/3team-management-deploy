import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import routes from "./router/routes";
import "./styles/index.scss";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element}>
              {route.children?.map((child, childIndex) => (
                <Route
                  key={childIndex}
                  index={child.index}
                  path={child.path}
                  element={child.element}
                />
              ))}
            </Route>
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
