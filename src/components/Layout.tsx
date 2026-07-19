import { Navbar } from './Navbar'
import { useRouter } from 'next/router'

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
    const router = useRouter()
    const isAuthPage = router.pathname.startsWith('/auth/')
    // The admin panel has its own sidebar navigation
    const isAdminPage = router.pathname.startsWith('/admin')

    return (
        <div className="min-h-screen">
            {!isAuthPage && !isAdminPage && <Navbar />}
            <main>{children}</main>
        </div>
    )
}

export default Layout
