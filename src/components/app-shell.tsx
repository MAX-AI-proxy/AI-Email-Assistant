"use client"

import { useState } from "react"

import { Mail, Menu, X } from "lucide-react"

const navigation = [
  { name: "Mail", icon: Mail, href: "/mail" },
]

export default function AppShell({
  children, demo = false,
}: {
  children: React.ReactNode
  demo?: boolean
}) {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false)

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f5f5f7]">
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center border-b border-white/[0.06] bg-[#0d0f12]/90 px-5 backdrop-blur-xl md:hidden">
        <button
          onClick={() =>
            setMobileMenuOpen(true)
          }
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#f5f5f7] transition hover:bg-white/[0.07]"
          aria-label="Menü öffnen"
        >
          <Menu
            size={20}
            strokeWidth={1.8}
          />
        </button>

        <span className="ml-3 text-[15px] font-semibold tracking-tight">
          AI Email Assistant
        </span>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() =>
            setMobileMenuOpen(false)
          }
          aria-label="Menü schließen"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Hauptnavigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col
          border-r border-white/[0.06] bg-[#111317]
          transition-transform duration-300 ease-out
          md:translate-x-0
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex h-20 items-center px-6">
          <span className="text-[16px] font-semibold tracking-[-0.02em]">
            AI Email Assistant
          </span>

          <button
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#8e8e93] transition hover:bg-white/[0.07] hover:text-white md:hidden"
            aria-label="Menü schließen"
          >
            <X
              size={19}
              strokeWidth={1.8}
            />
          </button>
        </div>

        <nav className="flex-1 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon

              const active =
                true

              return (
                <a
                  key={item.name}
                  href={demo ? "#mail" : item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className={`
                    flex w-full items-center gap-3 rounded-[10px]
                    px-3 py-2.5 text-left text-[14px]
                    transition
                    ${
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-[#9b9ba1] hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                  />

                  <span>
                    {item.name}
                  </span>
                </a>
              )
            })}
          </div>

        </nav>

        <div className="px-6 pb-6 text-[11px] text-[#595a60]">
          AI Email Assistant · {demo ? "Demo" : "Lokal"}
        </div>
      </aside>

      {/* Content */}
      <main className="min-h-screen pt-16 md:ml-[250px] md:pt-0">
        {children}
      </main>
    </div>
  )
}
