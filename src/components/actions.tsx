import { Action, Icon, Keyboard, showToast, Toast } from "@raycast/api";
import {
  brewName,
  brewInstall,
  brewUninstall,
  brewPinFormula,
  brewUnpinFormula,
  brewUpgrade,
  brewUpgradeAll,
  brewServiceRemove,
  Service,
  brewServiceRestart,
  brewServiceStop,
  brewServiceStart,
} from "../brew";
import { preferences } from "../preferences";
import { showActionToast, showFailureToast } from "../utils";
import { Cask, Formula, OutdatedFormula, Nameable } from "../brew";

export function FormulaInstallAction(props: {
  formula: Cask | Formula;
  onAction: (result: boolean) => void;
}): JSX.Element {
  // TD: Support installing other versions? Drew: Yes, please 🙏!
  return (
    <Action
      title={"Install"}
      icon={Icon.Plus}
      shortcut={{ modifiers: ["cmd"], key: "i" }}
      onAction={async () => {
        props.onAction(await install(props.formula));
      }}
    />
  );
}

export function FormulaUninstallAction(props: {
  formula: Cask | Nameable;
  onAction: (result: boolean) => void;
}): JSX.Element {
  return (
    <Action
      title="Uninstall"
      icon={Icon.Trash}
      shortcut={Keyboard.Shortcut.Common.Remove}
      style={Action.Style.Destructive}
      onAction={async () => {
        const result = await uninstall(props.formula);
        props.onAction(result);
      }}
    />
  );
}

export function FormulaUpgradeAction(props: {
  formula: Cask | Nameable;
  onAction: (result: boolean) => void;
}): JSX.Element {
  return (
    <Action
      title="Upgrade"
      icon={Icon.Hammer}
      shortcut={{ modifiers: ["cmd", "shift"], key: "u" }}
      onAction={async () => {
        const result = await upgrade(props.formula);
        props.onAction(result);
      }}
    />
  );
}

export function FormulaUpgradeAllAction(props: { onAction: (result: boolean) => void }): JSX.Element {
  return (
    <Action
      title="Upgrade All"
      icon={Icon.Hammer}
      onAction={async () => {
        const result = await upgradeAll();
        props.onAction(result);
      }}
    />
  );
}

export function FormulaPinAction(props: {
  formula: Formula | OutdatedFormula;
  onAction: (result: boolean) => void;
}): JSX.Element {
  const isPinned = props.formula.pinned;
  return (
    <Action
      title={isPinned ? "Unpin" : "Pin"}
      icon={Icon.Pin}
      shortcut={Keyboard.Shortcut.Common.Pin}
      onAction={async () => {
        if (isPinned) {
          props.onAction(await unpin(props.formula));
        } else {
          props.onAction(await pin(props.formula));
        }
      }}
    />
  );
}

/// Utilties

async function install(formula: Cask | Formula): Promise<boolean> {
  const abort = showActionToast({ title: `Installing ${brewName(formula)}`, cancelable: true });
  try {
    await brewInstall(formula, abort);
    showToast(Toast.Style.Success, `Installed ${brewName(formula)}`);
    return true;
  } catch (err) {
    showFailureToast("Install failed", err as Error);
    return false;
  }
}

async function uninstall(formula: Cask | Nameable): Promise<boolean> {
  const abort = showActionToast({ title: `Uninstalling ${brewName(formula)}`, cancelable: true });
  try {
    await brewUninstall(formula, abort);
    showToast(Toast.Style.Success, `Uninstalled ${brewName(formula)}`);
    return true;
  } catch (err) {
    showFailureToast("Uninstall failed", err as Error);
    return false;
  }
}

async function upgrade(formula: Cask | Nameable): Promise<boolean> {
  const abort = showActionToast({ title: `Upgrading ${brewName(formula)}`, cancelable: true });
  try {
    await brewUpgrade(formula, abort);
    showToast(Toast.Style.Success, `Upgraded ${brewName(formula)}`);
    return true;
  } catch (err) {
    showFailureToast("Upgrade formula failed", err as Error);
    return false;
  }
}

async function upgradeAll(): Promise<boolean> {
  const abort = showActionToast({ title: "Upgrading all formula", cancelable: true });
  try {
    await brewUpgradeAll(preferences.greedyUpgrades, abort);
    showToast(Toast.Style.Success, "Upgrade formula succeeded");
    return true;
  } catch (err) {
    showFailureToast("Upgrade formula failed", err as Error);
    return false;
  }
}

async function pin(formula: Formula | OutdatedFormula): Promise<boolean> {
  showToast(Toast.Style.Animated, `Pinning ${brewName(formula)}`);
  try {
    await brewPinFormula(formula);
    formula.pinned = true;
    showToast(Toast.Style.Success, `Pinned ${brewName(formula)}`);
    return true;
  } catch (err) {
    showFailureToast("Pin formula failed", err as Error);
    return false;
  }
}

async function unpin(formula: Formula | OutdatedFormula): Promise<boolean> {
  showToast(Toast.Style.Animated, `Unpinning ${brewName(formula)}`);
  try {
    await brewUnpinFormula(formula);
    formula.pinned = false;
    showToast(Toast.Style.Success, `Unpinned ${brewName(formula)}`);
    return true;
  } catch (err) {
    showFailureToast("Unpin formula failed", err as Error);
    return false;
  }
}

export function ServiceStartAction(props: { service: Service; onAction: (result: boolean) => void }): JSX.Element {
  return (
    <Action
      title="Start"
      icon={Icon.Play}
      shortcut={{ modifiers: ["cmd"], key: "s" }}
      onAction={async () => {
        props.onAction(await startService(props.service));
      }}
    />
  );
}

export function ServiceStopAction(props: { service: Service; onAction: (result: boolean) => void }): JSX.Element {
  return (
    <Action
      title="Stop"
      icon={Icon.Stop}
      shortcut={{ modifiers: ["cmd"], key: "x" }}
      style={Action.Style.Destructive}
      onAction={async () => {
        props.onAction(await stopService(props.service));
      }}
    />
  );
}

export function ServiceRestartAction(props: { service: Service; onAction: (result: boolean) => void }): JSX.Element {
  return (
    <Action
      title="Restart"
      icon={Icon.Repeat}
      shortcut={{ modifiers: ["cmd"], key: "r" }}
      onAction={async () => {
        props.onAction(await restartService(props.service));
      }}
    />
  );
}

export function ServiceRemoveAction(props: { service: Service; onAction: (result: boolean) => void }): JSX.Element {
  return (
    <Action
      title="Remove"
      icon={Icon.Trash}
      shortcut={Keyboard.Shortcut.Common.Remove}
      style={Action.Style.Destructive}
      onAction={async () => {
        props.onAction(await removeService(props.service));
      }}
    />
  );
}

async function startService(service: Service): Promise<boolean> {
  const abort = showActionToast({ title: `Starting ${service.name}`, cancelable: true });
  try {
    await brewServiceStart(service, abort);
    showToast(Toast.Style.Success, `Started ${service.name}`);
    return true;
  } catch (err) {
    showFailureToast("Start failed", err as Error);
    return false;
  }
}

async function stopService(service: Service): Promise<boolean> {
  const abort = showActionToast({ title: `Stopping ${service.name}`, cancelable: true });
  try {
    await brewServiceStop(service, abort);
    showToast(Toast.Style.Success, `Stopped ${service.name}`);
    return true;
  } catch (err) {
    showFailureToast("Stop failed", err as Error);
    return false;
  }
}

async function restartService(service: Service): Promise<boolean> {
  const abort = showActionToast({ title: `Restarting ${service.name}`, cancelable: true });
  try {
    await brewServiceRestart(service, abort);
    showToast(Toast.Style.Success, `Restarted ${service.name}`);
    return true;
  } catch (err) {
    showFailureToast("Restart failed", err as Error);
    return false;
  }
}

async function removeService(service: Service): Promise<boolean> {
  const abort = showActionToast({ title: `Removing ${service.name}`, cancelable: true });
  try {
    await brewServiceRemove(service, abort);
    showToast(Toast.Style.Success, `Removed ${service.name}`);
    return true;
  } catch (err) {
    showFailureToast("Remove failed", err as Error);
    return false;
  }
}
