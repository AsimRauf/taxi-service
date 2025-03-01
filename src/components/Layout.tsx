import { Navbar } from './Navbar'

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {

    return (
        <div className="min-h-screen">
            <Navbar />
            <main>{children}</main>
        </div>
    )
}

export default Layout
