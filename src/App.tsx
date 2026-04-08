import { useProductionSecurity } from "./hooks/useProductionSecurity";
import { Outlet } from "react-router-dom";
import { Providers } from "./Providers";

const App = () => {
  useProductionSecurity();
  
  return (
    <Providers>
      <Outlet />
    </Providers>
  );
};

export default App;
