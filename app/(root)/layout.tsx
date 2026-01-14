import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

function Layout({ children }: { children: React.ReactNode}) {
  return (
    <main className="relative">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <section className='flex min-h-screen flex-1 flex-col p-6'>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Layout;