import { Navbar } from './Navbar'
import { useRouter } from 'next/router'

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
    const router = useRouter()
    const isAuthPage = router.pathname.startsWith('/auth/')

    return (
        <div className="min-h-screen">
            {!isAuthPage && <Navbar />}
            <main>{children}</main>
        </div>
    )
}

export default Layout
