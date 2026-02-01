import { sidebarLinks } from '@/constants/sidebar'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Sidebar = () => {
  return (
    <section className=" sticky left-0 top-0 flex h-screen w-fit flex-col justify-between  overflow-y-auto p-6 shadow-light-300 dark:shadow-none  max-sm:hidden ">
      <div className='flex flex-1 flex-col gap-6'>
        {sidebarLinks.map((item) => {
          return (
            <Tooltip key={item.route}>
              <TooltipTrigger asChild>
                <Link href={item.route} className='flex items-center gap-4 text-lg font-medium text-text-500 transition-colors duration-300 hover:text-text-600 dark:text-text-400 dark:hover:text-text-300'>
                  {item.icon}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </section>
  )
}

export default Sidebar