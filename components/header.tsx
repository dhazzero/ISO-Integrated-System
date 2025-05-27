import { MainNav } from "@/components/main-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { UserButton } from "@/components/user-button"

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <h1 className="text-xl font-bold">ISO IMS</h1>
        </div>
        <div className="hidden md:flex">
          <MainNav />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
