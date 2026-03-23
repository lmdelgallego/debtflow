import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@debtflow/design-tokens", "@debtflow/domain", "@debtflow/supabase"]
};

export default nextConfig;
