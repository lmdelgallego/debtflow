"use client";

import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/dist/client/components/navigation'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Navbar = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/");
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

  return (
    <nav className="px-4 sm:px-5.5 flex basis-full items-center w-full mx-auto">
        <div className="w-full flex justify-between items-center gap-x-1.5">
          <Link href="/" className='flex z-40 font-semibold'>DebtFlow</Link>
          <div className='hidden items-center space-x-4 sm:flex'>
            {!user ? (
              <>
                <Link
                  href='/pricing'
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Pricing
                </Link>
                <Button
                  onClick={handleSignIn}
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}>
                  Sign in
                </Button>
                {/* <RegisterLink
                  className={buttonVariants({
                    size: 'sm',
                  })}>
                  Get started{' '}
                  <ArrowRight className='ml-1.5 h-5 w-5' />
                </RegisterLink> */}
              </>
            ) : (
              <div className='flex gap-3'>

                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Button
                    onClick={handleLogout}
                    className={buttonVariants({
                      variant: 'ghost',
                      size: 'sm',
                    })}>
                    Sign out
                  </Button>

                {/* <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? 'Your Account'
                      : `${user.given_name} ${user.family_name}`
                  }
                  email={user.email ?? ''}
                  imageUrl={user.picture ?? ''}
                /> */}
              </div>
            )}
          </div>
      </div>
    </nav>
  )
}

export default Navbar