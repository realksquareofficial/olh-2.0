import { useState, useEffect } from 'react';

const SearchBar = ({ materials, setFilteredMaterials }) => {
  const [searchTitle, setSearchTitle] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterRegulation, setFilterRegulation] = useState('');
  const [filterMaterialType, setFilterMaterialType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const subjects = [...new Set(materials.map(m => m.subject))].sort();

  useEffect(() => {
    let filtered = materials;

    if (searchTitle) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter(m => m.subject === filterSubject);
    }

    if (filterRegulation && filterRegulation !== 'all') {
      filtered = filtered.filter(m => m.regulationYear === filterRegulation);
    }

    if (filterMaterialType && filterMaterialType !== 'all') {
      filtered = filtered.filter(m => m.materialType === filterMaterialType);
    }

    setFilteredMaterials(filtered);
  }, [searchTitle, filterSubject, filterRegulation, filterMaterialType, materials, setFilteredMaterials]);

  const clearFilters = () => {
    setSearchTitle('');
    setFilterSubject('');
    setFilterRegulation('');
    setFilterMaterialType('');
  };

  const activeFiltersCount = [searchTitle, filterSubject, filterRegulation, filterMaterialType].filter(f => f && f !== 'all').length;

  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border-2 border-indigo-200 dark:border-gray-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder=" Search by title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-lg"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 relative"
          >
            <span className="text-xl">🎯</span>
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              ❌ Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📚 Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📅 Regulation Year
              </label>
              <select
                value={filterRegulation}
                onChange={(e) => setFilterRegulation(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Years</option>
                <option value="2019">2019</option>
                <option value="2023">2023</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📄 Material Type
              </label>
              <select
                value={filterMaterialType}
                onChange={(e) => setFilterMaterialType(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="notes">📝 Notes</option>
                <option value="question-paper">📄 Question Paper</option>
                <option value="syllabus">📋 Syllabus</option>
                <option value="reference-book">📚 Reference Book</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
          </div>
        )}

        {(searchTitle || filterSubject || (filterRegulation && filterRegulation !== 'all') || (filterMaterialType && filterMaterialType !== 'all')) && (
  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
    Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{materials.filter(m => {
      let match = true;
      if (searchTitle) match = match && m.title.toLowerCase().includes(searchTitle.toLowerCase());
      if (filterSubject) match = match && m.subject === filterSubject;
      if (filterRegulation && filterRegulation !== 'all') match = match && m.regulationYear === filterRegulation;
      if (filterMaterialType && filterMaterialType !== 'all') match = match && m.materialType === filterMaterialType;
      return match;
    }).length}</span> of <span className="font-bold">{materials.length}</span> materials
  </div>
)}

      </div>
    </div>
  );
};

export default SearchBar;