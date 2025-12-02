import MainLayout from "../layout/MainLayout";

/**
 * Wraps pages that use ONLY MainLayout (Header + Footer)
 * No sidebar
 */
const MainOnlyRoute = ({ element }) => {
  return <MainLayout>{element}</MainLayout>;
};

export default MainOnlyRoute;
