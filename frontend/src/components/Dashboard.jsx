import React, { useState, useEffect } from "react";
import { Copy, Trash2, Link2 } from "lucide-react";
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch user's existing short URLs from backend
  useEffect(() => {
    async function fetchUrls() {
      try {
        setUrlsLoading(true);
        const res = await fetch(`${API_BASE_URL}/url/userUrl/urls`, {
          credentials: "include",
        });
        
        console.log("URLs fetch response status:", res.status);
        
        if (res.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Please log in again',
            confirmButtonText: 'OK',
            confirmButtonColor: '#4f46e5'
          });
          return;
        }
        
        if (!res.ok) {
          throw new Error(`Failed to fetch URLs: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("URLs API response:", data);
        
        if (data && Array.isArray(data.urls)) {
          setUrls(data.urls);
        } else if (data && data.message) {
         
         setUrls([]);
        } else {
          console.warn("Unexpected response format:", data);
          setUrls([]);
        }
      } catch (err) {
        console.error("Error fetching URLs:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load your URLs',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4f46e5'
        });
        setUrls([]);
      } finally {
        setUrlsLoading(false);
      }
    }
    fetchUrls();
  }, []);

  async function handleShorten(e) {
    e.preventDefault();
    if (!url.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Required',
        text: 'Please enter a URL to shorten',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
        credentials: "include",
      });
      
      const data = await res.json();
      console.log("Shorten response:", data);
      
      if (res.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: 'Please log in again to shorten URLs',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4f46e5'
        });
        return;
      }
      
      if (res.ok) {
        const newUrl = {
          _id: data.id,
          shortID: data.id,
          redirectURL: url,
          shortUrl: data.shortUrl,
          visitHistory: [],
          createdBy: "current-user",
          createdAt: new Date()
        };
        
        setUrls(prevUrls => [newUrl, ...prevUrls]);
        setUrl("");
        
        Swal.fire({
          icon: 'success',
          title: 'URL Shortened!',
          html: `Your shortened URL is: <br><strong><a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></strong>`,
          confirmButtonText: 'Copy URL',
          confirmButtonColor: '#4f46e5',
          showCancelButton: true,
          cancelButtonText: 'Close',
          preConfirm: () => {
            navigator.clipboard.writeText(data.shortUrl);
            return data.shortUrl;
          }
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              icon: 'success',
              title: 'Copied!',
              text: 'URL copied to clipboard',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data?.message || 'Something went wrong',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4f46e5'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to shorten URL',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setUrls(prevUrls => prevUrls.filter((u) => u._id !== id && u.shortID !== id));
        
        const res = await fetch(`${API_BASE_URL}/url/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (res.ok) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Your URL has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else if (!res.ok && res.status !== 401) {
          Swal.fire({
            icon: 'info',
            title: 'Deleted Locally',
            text: 'URL removed from your list',
            timer: 1500,
            showConfirmButton: false
          });
        }
      } catch (err) {
        console.error("Error deleting URL:", err);
        Swal.fire({
          icon: 'info',
          title: 'Deleted Locally',
          text: 'URL removed from your list',
          timer: 1500,
          showConfirmButton: false
        });
      }
    }
  }

  function handleCopy(shortUrl, id) {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'URL copied to clipboard',
      timer: 1500,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
    
    setTimeout(() => setCopiedId(null), 2000);
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#4f46e5',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // ✅ Call backend logout endpoint to clear cookie
        const res = await fetch(`${API_BASE_URL}/user/logout`, {
          method: "POST",
          credentials: "include",
        });

        // Clear frontend storage regardless of backend response
        localStorage.removeItem("uid");
        localStorage.removeItem("userName");
        
        // Trigger storage event to update App.jsx
        window.dispatchEvent(new Event('storage'));
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          // ✅ Redirect to login page
          window.location.href = "/";
        });
        
      } catch (error) {
        console.error("Logout error:", error);
        // Still clear frontend and redirect even if backend call fails
        localStorage.removeItem("uid");
        localStorage.removeItem("userName");
        window.dispatchEvent(new Event('storage'));
        window.location.href = "/";
      }
    }
  };

  const getDisplayUrl = (item) => {
    if (item.shortUrl) return item.shortUrl;
    if (item.shortID) return `${API_BASE_URL}/${item.shortID}`;
    return "Invalid URL";
  };

  const getItemKey = (item) => {
    return item._id || item.shortID || `url-${Math.random().toString(36).substr(2, 9)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">🔗 URL Shortener</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-600 px-4 py-1.5 rounded-md font-medium hover:bg-indigo-50 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Main Section */}
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Shorten your link</h2>

          <form onSubmit={handleShorten} className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL..."
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium disabled:opacity-60 transition-colors"
            >
              {loading ? "Shortening..." : "Shorten"}
            </button>
          </form>
        </div>

        {/* URL List */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Your shortened links</h3>

          {urlsLoading ? (
            <p className="text-gray-500">Loading your URLs...</p>
          ) : urls.length === 0 ? (
            <p className="text-gray-500">No links yet. Shorten one above!</p>
          ) : (
            <div className="space-y-4">
              {urls.map((item) => {
                const displayUrl = getDisplayUrl(item);
                const itemKey = getItemKey(item);
                
                return (
                  <div
                    key={itemKey}
                    className="flex items-center justify-between bg-white shadow-sm border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Link2 size={16} /> 
                        {displayUrl}
                      </a>
                      <p className="text-sm text-gray-600 break-all mt-1 truncate">
                        {item.redirectURL}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Clicks: {item.visitHistory?.length || 0} • 
                        Created: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(displayUrl, itemKey)}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy
                          size={18}
                          className={
                            copiedId === itemKey
                              ? "text-green-600"
                              : "text-gray-600"
                          }
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id || item.shortID)}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        title="Delete URL"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}