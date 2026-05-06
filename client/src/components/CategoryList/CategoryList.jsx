import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { fetchCategory } from "../../service/CategoryService";

const CategoryList = ({ selectedCategoryId, onSelectCategory }) => {
  const { isDarkMode } = useTheme();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory().then((res) => {
      setCategories(res.data || []);
      setLoading(false);
    });
  }, []);

  const getClass = (catId) => {
    const active = selectedCategoryId === catId;

    if (isDarkMode) {
      return `d-flex align-items-center gap-2 px-3 py-2 rounded border 
            ${
              active
                ? "bg-primary text-white"
                : "bg-secondary bg-opacity-10 border-secondary text-white"
            }`;
    } else {
      return `d-flex align-items-center gap-2 px-3 py-2 rounded border 
            ${active ? "bg-primary text-white" : "bg-white shadow-sm"}`;
    }
  };

  if (loading) return <small>Loading...</small>;

  return (
    <div className="d-flex flex-wrap gap-3">
      <button
        className="btn btn-sm btn-outline-secondary"
        onClick={() => onSelectCategory(null)}
      >
        Clear Filter
      </button>
      {categories.map((cat) => (
        <div
          key={cat.categoryId}
          className={getClass(cat.categoryId)}
          style={{ cursor: "pointer" }}
          onClick={() => onSelectCategory(cat.categoryId)}
        >
          <div
            className="rounded-circle overflow-hidden border"
            style={{ width: "35px", height: "35px" }}
          >
            {cat.imgUrl && (
              <img
                src={cat.imgUrl}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          <span>{cat.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
