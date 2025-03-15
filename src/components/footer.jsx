import Link from "next/link";
const Footer = () => {
    return (
      <footer className="w-full border-t bg-gray-100 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="container px-4 md:px-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} SmartBlog. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Terms</Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Privacy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">Contact</Link>
          </div>
        </div>
      </footer>
    );
}

export default Footer