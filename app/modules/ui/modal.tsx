import { Dialog, Transition } from "@headlessui/react"
import { XIcon } from "@heroicons/react/outline"
import { createContext, Fragment, useContext } from "react"
import { Button } from "~/modules/ui/button"
import { RaisedPanel } from "~/modules/ui/raised-panel"

const CloseContext = createContext(() => {})

export function Modal({
  visible,
  onClose,
  children,
}: {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Transition show={visible} as={Fragment} appear>
      <Dialog onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition"
          enterFrom="transform opacity-0"
          enterTo="transform opacity-100"
          leave="transition"
          leaveFrom="transform opacity-100"
          leaveTo="transform opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>
        <CloseContext.Provider value={onClose}>
          {children}
        </CloseContext.Provider>
      </Dialog>
    </Transition>
  )
}

export function CenterDialogPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex">
      <Transition.Child
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog.Panel className="m-auto">
          <RaisedPanel>{children}</RaisedPanel>
        </Dialog.Panel>
      </Transition.Child>
    </div>
  )
}

export function DrawerDialogPanel({ children }: { children: React.ReactNode }) {
  const onClose = useContext(CloseContext)
  return (
    <Transition.Child
      as={Fragment}
      enter="transition ease-out"
      enterFrom="transform -translate-x-full opacity-0"
      enterTo="transform translate-x-0 opacity-100"
      leave="transition ease-in"
      leaveFrom="transform translate-x-0 opacity-100"
      leaveTo="transform -translate-x-full opacity-0"
    >
      <Dialog.Panel className="fixed inset-y-0 flex items-start duration-200 pointer-events-none">
        <div className="h-full pointer-events-auto">
          <RaisedPanel fullHeight rounded={false}>
            {children}
          </RaisedPanel>
        </div>
        <div className="p-2 pointer-events-auto">
          <Button
            variant="ghost"
            icon={<XIcon className="w-6" />}
            label={<span className="sr-only">Close</span>}
            shape="circle"
            onClick={onClose}
          />
        </div>
      </Dialog.Panel>
    </Transition.Child>
  )
}
