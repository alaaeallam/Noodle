#!/usr/bin/env bash
set -euo pipefail

# Config — tweak paths if your monorepo differs
ROOT_DIR="${1:-$(pwd)}"
API_DIRS=("api" "apps/api" "packages/api" "services/api" "apps/server" "packages/server")
ADMIN_DIRS=("apps/admin" "packages/admin")
CUSTOMER_DIRS=("apps/customer" "apps/web" "apps/store" "apps/rider")
SHARED_DIRS=("packages/lib" "packages/utils" "packages/context" "packages/hooks" "packages/ui")

OUT_DIR="${ROOT_DIR}/.audit"
mkdir -p "${OUT_DIR}"

TXT="${ROOT_DIR}/gql_map.txt"
JSON="${ROOT_DIR}/gql_map.json"
DB_MAP="${OUT_DIR}/db_map.txt"
ROUTES_MAP="${OUT_DIR}/routes_map.txt"
IMPORTS_MAP="${OUT_DIR}/imports_map.txt"

# Helpers
hr() { printf '%*s\n' "80" '' | tr ' ' '-'; }
section() { echo; hr; echo "# $1"; hr; }

safe_find() {
  local dir="$1"; shift
  if [ -d "${dir}" ]; then
    find "${dir}" "$@"
  fi
}

rg_paths() {
  local pattern="$1"; shift
  grep -RIl --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist --exclude-dir=.turbo --include='*.{ts,tsx,js,jsx,graphql,gql}' "$pattern" "$@" || true
}

echo "" > "${TXT}"
echo "{" > "${JSON}"

# 1) API: typeDefs / resolvers / models
section "API: GraphQL typeDefs / resolvers / models" | tee -a "${TXT}"
echo '  "api": {' >> "${JSON}"

for base in "${API_DIRS[@]}"; do
  [ -d "${ROOT_DIR}/${base}" ] || continue
  API_PATH="${ROOT_DIR}/${base}"

  echo "## ${base}" | tee -a "${TXT}"
  {
    echo "    \"${base}\": {"
    echo "      \"typeDefs\": ["
  } >> "${JSON}"

  # TypeDefs
  TYPEDEF_FILES=$(safe_find "${API_PATH}" -type f \( -name '*.graphql' -o -name '*.gql' -o -name '*typeDefs*.ts' -o -name '*schema*.ts' -o -name '*typeDefs*.js' -o -name '*schema*.js' \))
  echo "${TYPEDEF_FILES}" | sed 's/^/ - /' | tee -a "${TXT}"
  echo "${TYPEDEF_FILES}" | sed 's/"/\\"/g; s/.*/        "&",/' | sed 's/&/&&/g' | sed 's/&&/\\&/g' >> "${JSON}" || true
  echo "      ]," >> "${JSON}"

  # Resolvers
  echo "### resolvers" | tee -a "${TXT}"
  RESOLVER_FILES=$(safe_find "${API_PATH}" -type f \( -name '*resolver*.ts' -o -name '*resolvers*.ts' -o -name '*resolver*.js' -o -name '*resolvers*.js' \))
  echo "${RESOLVER_FILES}" | sed 's/^/ - /' | tee -a "${TXT}"
  echo "      \"resolvers\": [" >> "${JSON}"
  echo "${RESOLVER_FILES}" | sed 's/"/\\"/g; s/.*/        "&",/' >> "${JSON}" || true
  echo "      ]," >> "${JSON}"

  # Models (e.g., mongoose)
  echo "### models" | tee -a "${TXT}"
  MODEL_FILES=$(safe_find "${API_PATH}" -type f \( -name '*model*.ts' -o -name 'models/*.ts' -o -name '*model*.js' -o -name 'models/*.js' \))
  echo "${MODEL_FILES}" | sed 's/^/ - /' | tee -a "${TXT}"
  echo "      \"models\": [" >> "${JSON}"
  echo "${MODEL_FILES}" | sed 's/"/\\"/g; s/.*/        "&",/' >> "${JSON}" || true
  echo "      ]" >> "${JSON}"

  echo "    }," >> "${JSON}"

  # Extract types/queries/mutations for quick view
  echo "### extracted GraphQL definitions (types/Query/Mutation)" | tee -a "${TXT}"
  if [ -n "${TYPEDEF_FILES}" ]; then
    grep -RInE '^(type|input|enum)\s+(Category|SubCategory|Product|Addon)|^type\s+Query|^type\s+Mutation' ${TYPEDEF_FILES} | sed "s|${ROOT_DIR}/||" | tee -a "${TXT}" || true
  fi

done
# Trim trailing comma in JSON api object by re-writing—simple approach:
sed -i '' -e '$ s/},$/}/' "${JSON}" 2>/dev/null || sed -i -e '$ s/},$/}/' "${JSON}"
echo "  }," >> "${JSON}"

# 2) Admin app: queries/mutations/hooks/pages/components
section "Admin: queries / mutations / hooks / pages / components" | tee -a "${TXT}"
echo '  "admin": {' >> "${JSON}"

for base in "${ADMIN_DIRS[@]}"; do
  [ -d "${ROOT_DIR}/${base}" ] || continue
  ADMIN_PATH="${ROOT_DIR}/${base}"
  echo "## ${base}" | tee -a "${TXT}"
  echo "    \"${base}\": {" >> "${JSON}"

  echo "### GraphQL client files" | tee -a "${TXT}"
  CLIENT_GQL=$(safe_find "${ADMIN_PATH}" -type f \( -name '*.graphql' -o -name '*.gql' -o -name '*queries*.ts' -o -name '*mutations*.ts' \))
  echo "${CLIENT_GQL}" | sed 's/^/ - /' | tee -a "${TXT}"
  echo "      \"clientGql\": [" >> "${JSON}"
  echo "${CLIENT_GQL}" | sed 's/"/\\"/g; s/.*/        "&",/' >> "${JSON}" || true
  echo "      ]," >> "${JSON}"

  echo "### pages likely tied to CRUD" | tee -a "${TXT}"
  PAGES=$(safe_find "${ADMIN_PATH}/app" -type f -name 'page.tsx' -o -name 'page.jsx' | grep -E '/(category|categories|sub-?category|product|addon|add-ons|products)/' || true)
  echo "${PAGES}" | sed 's/^/ - /' | tee -a "${TXT}"
  echo "      \"pages\": [" >> "${JSON}"
  echo "${PAGES}" | sed 's/"/\\"/g; s/.*/        "&",/' >> "${JSON}" || true
  echo "      ]," >> "${JSON}"

  echo "### components likely tied to CRUD" | tee -a "${TXT}"
  CMPTS=$(safe_find "${ADMIN_PATH}" -type f -name '*.tsx' -o -name '*.ts' | grep -E '/(category|categories|sub-?category|product|addon|add-ons)/' || true)
  echo "${CMPTS}" | sed 's/^/ - /' | tee -a "${TXT}"
  echo "      \"components\": [" >> "${JSON}"
  echo "${CMPTS}" | sed 's/"/\\"/g; s/.*/        "&",/' >> "${JSON}" || true
  echo "      ]" >> "${JSON}"

  echo "    }," >> "${JSON}"
done
sed -i '' -e '$ s/},$/}/' "${JSON}" 2>/dev/null || sed -i -e '$ s/},$/}/' "${JSON}"
echo "  }," >> "${JSON}"

# 3) DB map (mongoose schemas)
section "DB models (mongoose schemas)" | tee "${DB_MAP}"
for base in "${API_DIRS[@]}"; do
  [ -d "${ROOT_DIR}/${base}" ] || continue
  safe_find "${ROOT_DIR}/${base}" -type f -name '*.ts' -o -name '*.js' \
    | xargs grep -HnE 'new\s+Schema|mongoose\.model|Schema\(' || true
done

# 4) Routes map (Next.js app routes and API routes)
section "Next.js routes & API handlers" | tee "${ROUTES_MAP}"
for app in "${ADMIN_DIRS[@]}" "${CUSTOMER_DIRS[@]}"; do
  [ -d "${ROOT_DIR}/${app}" ] || continue
  echo "## ${app}" | tee -a "${ROUTES_MAP}"
  safe_find "${ROOT_DIR}/${app}/app" -type f \( -name 'page.tsx' -o -name 'route.ts' -o -name 'page.jsx' -o -name 'route.js' \) \
    | sed "s|${ROOT_DIR}/||" | tee -a "${ROUTES_MAP}"
done

# 5) Imports map for entities (what touches what)
section "Imports map (Category/SubCategory/Product/Addon)" | tee "${IMPORTS_MAP}"
rg_paths 'Category|SubCategory|Product|Addon' "${ROOT_DIR}" \
  | sed "s|${ROOT_DIR}/||" \
  | tee -a "${IMPORTS_MAP}"

# 6) Append summarized sections into gql_map.txt
{
  section "DB Map (snippets)"; cat "${DB_MAP}"
  section "Routes Map"; cat "${ROUTES_MAP}"
  section "Imports Map"; cat "${IMPORTS_MAP}"
} >> "${TXT}"

# Close JSON
echo "}" >> "${JSON}"

echo
echo "Wrote:"
echo " - ${TXT}"
echo " - ${JSON}"
echo " - ${DB_MAP}"
echo " - ${ROUTES_MAP}"
echo " - ${IMPORTS_MAP}"