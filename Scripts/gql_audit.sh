# ./Scripts/gql_audit.sh
set -euo pipefail

ADMIN_DIR="apps/admin/lib/api/graphql"
API_DIR="apps/api"

echo "=== Admin operations (Category/SubCategory/Food/Addon/Option) ==="
rg -IN --no-heading --line-number \
  -e 'gql`(mutation|query)\s+([a-zA-Z0-9_]+)' \
  "$ADMIN_DIR" | rg -i 'category|sub.?category|food|addon|option' || true

echo
echo "=== API SDL (schema) – operation names & inputs ==="
rg -IN --no-heading --line-number \
  -e 'type\s+Mutation|type\s+Query|extend\s+type\s+(Mutation|Query)|input\s+[A-Za-z]+' \
  "$API_DIR/graphql" | rg -i 'category|sub.?category|food|addon|option|restaurant' || true

echo
echo "=== API resolvers – implemented fields ==="
rg -IN --no-heading --line-number \
  -e '\b(Mutation|Query)\b' "$API_DIR/graphql/resolvers" | rg -i 'category|sub.?category|food|addon|option' || true

echo
echo "=== Models present ==="
ls -1 "$API_DIR/models" | rg -i 'category|sub|food|addon|option' || true