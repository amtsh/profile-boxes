import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { shakespeareProfile } from "@/data/shakespeare";
import type { Profile, ProfileState, ThemeId, Widget, WidgetSize } from "@/lib/bento-types";

const STORAGE_KEY = "bento-profile-v1";
const DRAG_HINT_KEY = "bento-dragged";
const HISTORY_LIMIT = 50;

type Action =
  | { type: "hydrate"; state: ProfileState }
  | { type: "restore"; state: ProfileState }
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
    case "restore":
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
  dispatch: (action: Action) => void;
  editing: boolean;
  setEditing: (v: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  focusWidgetId: string | null;
  setFocusWidgetId: (id: string | null) => void;
  hydrated: boolean;
  preview: PreviewDevice;
  setPreview: (v: PreviewDevice) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  linkNonce: number;
  requestLinkMode: () => void;
  hasDragged: boolean;
  markDragged: () => void;
}

const ProfileContext = createContext<StoreValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, shakespeareProfile, structuredClone);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [editing, setEditingRaw] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusWidgetId, setFocusWidgetId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [past, setPast] = useState<ProfileState[]>([]);
  const [future, setFuture] = useState<ProfileState[]>([]);
  const [linkNonce, setLinkNonce] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileState;
        if (parsed?.profile && Array.isArray(parsed.widgets)) {
          rawDispatch({ type: "hydrate", state: parsed });
        }
      }
      if (window.sessionStorage.getItem(DRAG_HINT_KEY) === "1") setHasDragged(true);
      if (new URLSearchParams(window.location.search).has("edit")) setEditingRaw(true);
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

  const dispatch = useCallback((action: Action) => {
    if (action.type !== "hydrate" && action.type !== "restore") {
      setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), structuredClone(stateRef.current)]);
      setFuture([]);
    }
    rawDispatch(action);
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1]!;
      setFuture((f) => [...f, structuredClone(stateRef.current)]);
      rawDispatch({ type: "restore", state: prev });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[f.length - 1]!;
      setPast((p) => [...p, structuredClone(stateRef.current)]);
      rawDispatch({ type: "restore", state: next });
      return f.slice(0, -1);
    });
  }, []);

  const setEditing = useCallback((v: boolean) => {
    setEditingRaw(v);
    if (!v) {
      setSelectedId(null);
      setFocusWidgetId(null);
    }
  }, []);

  const requestLinkMode = useCallback(() => setLinkNonce((n) => n + 1), []);

  const markDragged = useCallback(() => {
    setHasDragged(true);
    try {
      window.sessionStorage.setItem(DRAG_HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const [preview, setPreview] = useState<PreviewDevice>("desktop");

  const value = useMemo(
    () => ({
      state,
      dispatch,
      editing,
      setEditing,
      selectedId,
      setSelectedId,
      focusWidgetId,
      setFocusWidgetId,
      hydrated,
      preview,
      setPreview,
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      linkNonce,
      requestLinkMode,
      hasDragged,
      markDragged,
    }),
    [
      state,
      dispatch,
      editing,
      setEditing,
      selectedId,
      focusWidgetId,
      hydrated,
      preview,
      undo,
      redo,
      past.length,
      future.length,
      linkNonce,
      requestLinkMode,
      hasDragged,
      markDragged,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileStore() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileStore must be used inside ProfileProvider");
  return ctx;
}
