import { Color, Icon, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { Service, brewServicesList } from "./brew";
import { ServiceActionPanel } from "./components/actionPanels";

export default function Command() {
  const { isLoading, data: services, revalidate } = useCachedPromise(() => brewServicesList());

  return (
    <List isLoading={isLoading}>
      {services?.map((service) => (
        <ServiceListItem key={service.name} service={service} onAction={() => revalidate()} />
      ))}
    </List>
  );
}

function ServiceListItem({ service, onAction }: { service: Service; onAction: () => void }) {
  const icon = { source: Icon.Circle };
  let tintColor: Color | undefined;
  
  switch (service.status) {
    case "started":
      tintColor = Color.Green;
      icon.source = Icon.Play;
      break;
    case "error":
      tintColor = Color.Red;
      icon.source = Icon.ExclamationMark;
      break;
    default:
      tintColor = Color.SecondaryText;
      icon.source = Icon.Circle;
  }

  const accessories = [
    { text: service.status === "none" ? "" : service.status },
    ...(service.user ? [{ text: `user: ${service.user}` }] : []),
    ...(service.error ? [{ text: service.error, tooltip: service.error }] : []),
  ];

  return (
    <List.Item
      title={service.name}
      accessories={accessories}
      icon={{ ...icon, tintColor }}
      actions={<ServiceActionPanel service={service} onAction={onAction} />}
    />
  );
}
