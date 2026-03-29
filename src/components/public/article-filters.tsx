import Link from "next/link";

type ArticleFiltersProps = {
  query: string;
  categoryId?: string;
  tagId?: string;
  categories: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
};

export function ArticleFilters({ query, categoryId, tagId, categories, tags }: ArticleFiltersProps) {
  return (
    <form action="/articles" className="filter-form">
      <label className="field">
        <span>Vyhledávání</span>
        <input name="q" type="search" defaultValue={query} placeholder="Název nebo text článku" />
      </label>

      <label className="field">
        <span>Kategorie</span>
        <select name="category" defaultValue={categoryId ?? ""}>
          <option value="">Všechny</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Tag</span>
        <select name="tag" defaultValue={tagId ?? ""}>
          <option value="">Všechny</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-actions">
        <button type="submit" className="button-primary">
          Filtrovat
        </button>
        <Link href="/articles" className="button-secondary">
          Reset
        </Link>
      </div>
    </form>
  );
}
