import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

function Layout({ children }: { children: React.ReactNode}) {
  return (
    <main className="relative">
      <Navbar />
      <div className="flex overflow-hidden h-screen p-6 gap-4">
        <Sidebar />
        <section className='w-full'>
            {children}
        </section>
      </div>
    </main>
  )
}

export default Layout;