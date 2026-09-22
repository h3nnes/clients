import { of } from "rxjs";

import { EnvironmentService } from "../../platform/abstractions/environment.service";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";

import { AnonymousHubService } from "./anonymous-hub.service";

jest.mock("@microsoft/signalr", () => {
  const start = jest.fn().mockResolvedValue(undefined);
  const on = jest.fn();
  const build = jest.fn(() => ({ start, on }));
  const withHubProtocol = jest.fn(() => ({ build }));
  const withUrl = jest.fn(() => ({ withHubProtocol }));
  const HubConnectionBuilder = jest.fn(() => ({ withUrl }));
  return { HubConnectionBuilder, HttpTransportType: { WebSockets: 1 } };
});

jest.mock("@microsoft/signalr-protocol-msgpack", () => ({
  MessagePackHubProtocol: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { HubConnectionBuilder } = require("@microsoft/signalr");

describe("AnonymousHubService", () => {
  function makeEnvironment(header: { name: string; value: string } | null) {
    return {
      getNotificationsUrl: () => "https://notifications.example.com",
      getCustomRequestHeader: () => header,
    } as any;
  }

  function makeSut(header: { name: string; value: string } | null) {
    const environmentService = {
      environment$: of(makeEnvironment(header)),
    } as unknown as EnvironmentService;
    const platformUtilsService = {
      isDev: () => false,
    } as unknown as PlatformUtilsService;
    return new AnonymousHubService(environmentService, {} as any, platformUtilsService);
  }

  beforeEach(() => {
    (HubConnectionBuilder as unknown as jest.Mock).mockClear();
  });

  it("does not create a SignalR connection when a custom request header is configured", async () => {
    const sut = makeSut({ name: "X-Auth", value: "tok" });

    await sut.createHubConnection("token");

    expect(HubConnectionBuilder).not.toHaveBeenCalled();
  });

  it("creates a SignalR connection when no custom request header is configured", async () => {
    const sut = makeSut(null);

    await sut.createHubConnection("token");

    expect(HubConnectionBuilder).toHaveBeenCalledTimes(1);
  });
});
