import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

function Layout({ children }: { children: React.ReactNode}) {
  return (
    <div className="overflow-hidden">
      <header className="fixed top-0 inset-x-0 flex justify-center z-50 py-3 backdrop-blur-lg w-full ">
        <Navbar />
      </header>
      <main className="grid grid-cols-12 overflow-hidden gap-6">
        <div className="col-span-2 pt-15">
          <Sidebar />
        </div>
        <div className="col-span-10 w-full overflow-hidden p-3 ">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout;
