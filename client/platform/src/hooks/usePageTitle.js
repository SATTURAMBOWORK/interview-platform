import { useEffect } from "react";

/**
 * Sets the browser tab title for the current page.
 * @param {string} title - Page-specific title (e.g. "Dashboard")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | InterviewPrep` : "InterviewPrep";
    return () => {
      document.title = prev;
    };
  }, [title]);
};

export default usePageTitle;
