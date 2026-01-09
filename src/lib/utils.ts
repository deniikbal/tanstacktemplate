import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getJakartaDate() {
  const date = new Date()
  const jakartaTime = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
  const year = jakartaTime.getFullYear()
  const month = String(jakartaTime.getMonth() + 1).padStart(2, '0')
  const day = String(jakartaTime.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
