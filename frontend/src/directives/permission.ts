import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user'

type PermissionValue = string | string[]

function checkPermission(binding: DirectiveBinding<PermissionValue>): boolean {
  const userStore = useUserStore()
  const userRole = userStore.userInfo?.role
  if (!userRole) return false

  const required = Array.isArray(binding.value) ? binding.value : [binding.value]

  if (binding.modifiers.role) {
    return required.includes(userRole)
  }

  return required.includes(userRole)
}

export const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    if (!checkPermission(binding)) {
      el.parentNode?.removeChild(el)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    if (!checkPermission(binding)) {
      el.parentNode?.removeChild(el)
    }
  }
}

export const vRole: Directive<HTMLElement, string> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const userStore = useUserStore()
    const userRole = userStore.userInfo?.role
    const requiredRole = binding.value

    if (!userRole || userRole !== requiredRole) {
      el.parentNode?.removeChild(el)
    }
  }
}
