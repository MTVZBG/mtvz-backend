import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"

const SiteAssetsPage = () => {
  return (
    <Container className="p-6">
      <Heading level="h1">Site Assets</Heading>
      <Text className="mt-2 text-ui-fg-subtle">
        Тук ще изведем banner management за MTVZ.
      </Text>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Site Assets",
})

export default SiteAssetsPage