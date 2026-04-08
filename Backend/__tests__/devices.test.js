import deviceRoutes from "../routes/DeviceRoutes.js";

const getRouteLayer = (path, method) =>
  deviceRoutes.stack.find(
    (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
  );

describe("Device router structure", () => {
  it("registers list and create device routes", () => {
    const getDevices = getRouteLayer("/", "get");
    const createDevice = getRouteLayer("/", "post");

    expect(getDevices).toBeDefined();
    expect(createDevice).toBeDefined();
  });

  it("registers toggle device route", () => {
    const toggleDevice = getRouteLayer("/toggle/:id", "put");
    expect(toggleDevice).toBeDefined();
  });

  it("registers power history routes", () => {
    const addHistory = getRouteLayer("/:deviceId/power-history", "post");
    const getHistory = getRouteLayer("/:deviceId/power-history", "get");

    expect(addHistory).toBeDefined();
    expect(getHistory).toBeDefined();
  });
});
