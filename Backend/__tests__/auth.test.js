import authRoutes from "../routes/AuthRoutes.js";

const getRouteLayer = (path, method) =>
  authRoutes.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );

describe("Auth router structure", () => {
  it("registers public signup, login, and Google login routes", () => {
    const signupRoute = getRouteLayer("/signup", "post");
    const loginRoute = getRouteLayer("/login", "post");
    const googleRoute = getRouteLayer("/google", "post");

    expect(signupRoute).toBeDefined();
    expect(loginRoute).toBeDefined();
    expect(googleRoute).toBeDefined();

    // Public routes should not include auth middleware as first handler.
    expect(signupRoute.route.stack[0].name).not.toBe("verifyAuth");
    expect(loginRoute.route.stack[0].name).not.toBe("verifyAuth");
    expect(googleRoute.route.stack[0].name).not.toBe("verifyAuth");
  });

  it("protects profile route with verifyAuth middleware", () => {
    const profileRoute = getRouteLayer("/profile", "get");

    expect(profileRoute).toBeDefined();
    expect(profileRoute.route.stack[0].name).toBe("verifyAuth");
  });

  it("protects settings and account routes with verifyAuth middleware", () => {
    const settingsGet = getRouteLayer("/settings", "get");
    const settingsPut = getRouteLayer("/settings", "put");
    const deleteAccount = getRouteLayer("/account", "delete");

    expect(settingsGet).toBeDefined();
    expect(settingsPut).toBeDefined();
    expect(deleteAccount).toBeDefined();

    expect(settingsGet.route.stack[0].name).toBe("verifyAuth");
    expect(settingsPut.route.stack[0].name).toBe("verifyAuth");
    expect(deleteAccount.route.stack[0].name).toBe("verifyAuth");
  });
});
