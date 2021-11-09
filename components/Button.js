export default function Button({url = "#", children}) {
  return (
    <a className="bg-gray-100 p-4 backdrop-blur rounded" href={url}>
      {children}
    </a>
  )
}