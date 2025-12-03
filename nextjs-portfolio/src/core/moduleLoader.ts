import dynamic from "next/dynamic";

const modules: Record<string, any> = {
  "real-estate-template-1": {
    admin: dynamic(() => import("../products/real-estate/admin")),
    page: dynamic(() => import("../products/real-estate/pages/page"), {
      ssr: false,
      loading: () => null,
    }),
  },
};

console.log("MODULE LOADER INITIALIZED");
console.log("Niches available:", Object.keys(modules));

export default modules;
