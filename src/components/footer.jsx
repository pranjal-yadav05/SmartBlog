const Footer = () => {
    return (
        <footer className="w-full border-t bg-gray-100 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} SmartBlog. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
}

export default Footer