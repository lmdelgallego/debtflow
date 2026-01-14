import { sidebarLinks } from '@/constants/sidebar'
import Link from 'next/link'
import React from 'react'

const Sidebar = () => {
  return (
    <section className="light-border sticky left-0 top-0 flex h-screen w-fit flex-col justify-between  overflow-y-auto border-r p-6 shadow-light-300 dark:shadow-none  max-sm:hidden lg:w-[266px]">
      <div className='flex flex-1 flex-col gap-6'>
        {sidebarLinks.map((item) => {
          return (
            <Link key={item.route} href={item.route} className='flex items-center gap-4 text-lg font-medium text-text-500 transition-colors duration-300 hover:text-text-600 dark:text-text-400 dark:hover:text-text-300'>
              {item.icon}
              {item.title}
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default Sidebar