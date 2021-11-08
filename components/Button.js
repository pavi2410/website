export default function Button({href = "#", children}) {
  return (
    <a className="bg-gray-100 p-4 backdrop-blur rounded" href={href}>
      {children}
    </a>
  )
}