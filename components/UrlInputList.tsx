import React from 'react';

interface UrlInputListProps {
  urls: string[];
  onChange: (newUrls: string[]) => void;
  disabled?: boolean;
}

export const UrlInputList: React.FC<UrlInputListProps> = ({ urls, onChange, disabled }) => {
  
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    onChange(newUrls);
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      onChange([...urls, '']);
    }
  };

  const removeUrlField = (index: number) => {
    const newUrls = urls.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-slate-700">
          Source URLs <span className="text-slate-400 font-normal">(Max 5)</span>
        </label>
        <span className="text-xs text-slate-500">{urls.length}/5 links</span>
      </div>
      
      {urls.map((url, index) => (
        <div key={index} className="flex gap-2 items-center group">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder="Paste travel blog or website link here..."
              disabled={disabled}
              className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          
          {urls.length > 1 && (
            <button
              onClick={() => removeUrlField(index)}
              disabled={disabled}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Remove URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      ))}

      {urls.length < 5 && (
        <button
          onClick={addUrlField}
          disabled={disabled}
          className="text-sm text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1 mt-2 px-1 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add another URL
        </button>
      )}
    </div>
  );
};