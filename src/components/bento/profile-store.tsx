import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { shakespeareProfile } from "@/data/shakespeare";
import type { Profile, ProfileState, ThemeId, Widget, WidgetSize } from "@/lib/bento-types";

const STORAGE_KEY = "bento-profile-v1";

type Action =
  | { type: "hydrate"; state: ProfileState }
  | { type: "reset" }
  | { type: "reorder"; widgets: Widget[] }
  | { type: "add"; widget: Widget }
  | { type: "update"; id: string; patch: Partial<Widget> }
  | { type: "resize"; id: string; size: WidgetSize }
  | { type: "remove"; id: string }
  | { type: "profile"; patch: Partial<Profile> }
  | { type: "theme"; theme: ThemeId };

function reducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return structuredClone(shakespeareProfile);
    case "reorder":
      return { ...state, widgets: action.widgets };
    case "add":
      return { ...state, widgets: [action.widget, ...state.widgets] };
    case "update":
      return {
        ...state,
        widgets: state.widgets.map((w) =>
          w.id === action.id ? ({ ...w, ...action.patch } as Widget) : w,
        ),
      };
    case "resize":
      return {
        ...state,
        widgets: state.widgets.map((w) => (w.id === action.id ? { ...w, size: action.size } : w)),
      };
    case "remove":
      return { ...state, widgets: state.widgets.filter((w) => w.id !== action.id) };
    case "profile":
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case "theme":
      return { ...state, theme: action.theme };
    default:
      return state;
  }
}

export type PreviewDevice = "desktop" | "mobile";

interface StoreValue {
  state: ProfileState;
  dispatch: React.Dispatch<Action>;
  editing: boolean;
  setEditing: (v: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  hydrated: boolean;
  preview: PreviewDevice;
  setPreview: (v: PreviewDevice) => void;
}

const ProfileContext = createContext<StoreValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, shakespeareProfile, structuredClone);
  const [editing, setEditingRaw] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileState;
        if (parsed?.profile && Array.isArray(parsed.widgets)) {
          dispatch({ type: "hydrate", state: parsed });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const setEditing = useCallback((v: boolean) => {
    setEditingRaw(v);
    if (!v) setSelectedId(null);
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, editing, setEditing, selectedId, setSelectedId, hydrated }),
    [state, editing, setEditing, selectedId, hydrated],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileStore() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileStore must be used inside ProfileProvider");
  return ctx;
}
