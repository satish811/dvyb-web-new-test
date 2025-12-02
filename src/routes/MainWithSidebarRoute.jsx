import MainLayout from "../layout/MainLayout";
import SecondaryLayout from "../layout/SecondaryLayout";

/**
 * Wraps pages that use BOTH layouts:
 * - MainLayout (Header + Footer)
 * - SecondaryLayout (Sidebar + Content)
 */
const MainWithSidebarRoute = ({ element }) => {
  return (
    <MainLayout>
      <SecondaryLayout>{element}</SecondaryLayout>
    </MainLayout>
  );
};

export default MainWithSidebarRoute;
