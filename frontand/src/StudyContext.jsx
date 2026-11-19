import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { studyApi } from "./api/study.js";

const StudyContext = createContext(null);

export function StudyProvider({ children, onToast }) {
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const activePage = useRef("Dashboard");

  const refresh = useCallback(async () => {
    const [itemsResult, progressResult] = await Promise.all([
      studyApi.listItems(),
      studyApi.progress(),
    ]);
    setItems(itemsResult.items);
    setProgress(progressResult);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([studyApi.listItems(), studyApi.progress()])
      .then(([itemsResult, progressResult]) => {
        if (!active) return;
        setItems(itemsResult.items);
        setProgress(progressResult);
      })
      .catch((error) => {
        if (active) onToast(error.message, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onToast]);

  useEffect(() => {
    let seconds = 0;
    let lastTick = Date.now();
    let busy = false;

    const flush = async (refreshProgress = true, keepalive = false) => {
      const elapsed = Math.min(300, Math.floor(seconds));
      if (!elapsed || busy) return;
      seconds -= elapsed;
      busy = true;
      try {
        await studyApi.track(elapsed, activePage.current, keepalive);
        if (refreshProgress) setProgress(await studyApi.progress());
      } catch (error) {
        if (refreshProgress) onToast(error.message, "error");
      } finally {
        busy = false;
      }
    };

    const flushWhenHidden = () => {
      if (document.visibilityState === "hidden") void flush(false, true);
    };
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTick) / 1000);
      lastTick = now;
      if (document.visibilityState === "visible" && delta > 0 && delta <= 90) {
        seconds += delta;
      }
      if (seconds >= 30) void flush();
    }, 15000);
    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flushWhenHidden);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flushWhenHidden);
    };
  }, [onToast]);

  const createItem = useCallback(
    async (item) => {
      const result = await studyApi.createItem(item);
      setItems((current) => [result.item, ...current]);
      setProgress(await studyApi.progress());
      return result.item;
    },
    [],
  );

  const saveCreatedItem = useCallback(
    (item) => {
      setItems((current) => [item, ...current.filter((entry) => entry._id !== item._id)]);
      studyApi
        .progress()
        .then(setProgress)
        .catch((error) => {
          onToast(`The item was saved, but progress could not be refreshed: ${error.message}`, "error");
        });
      return item;
    },
    [onToast],
  );

  const deleteItem = useCallback(async (id) => {
    await studyApi.deleteItem(id);
    setItems((current) => current.filter((item) => item._id !== id));
    setProgress(await studyApi.progress());
  }, []);

  const updateItem = useCallback(async (id, item) => {
    const result = await studyApi.updateItem(id, item);
    setItems((current) =>
      current.map((entry) => (entry._id === id ? result.item : entry)),
    );
    return result.item;
  }, []);

  const uploadItem = useCallback(async (file, subject) => {
    const result = await studyApi.upload(file, subject);
    setItems((current) => [result.item, ...current]);
    setProgress(await studyApi.progress());
    return result.item;
  }, []);

  const setActivePage = useCallback((page) => {
    activePage.current = page;
  }, []);

  const contextValue = useMemo(
    () => ({
      items,
      progress,
      loading,
      refresh,
      createItem,
      saveCreatedItem,
      deleteItem,
      updateItem,
      uploadItem,
      setActivePage,
      studyApi,
      onToast,
    }),
    [
      items,
      progress,
      loading,
      refresh,
      createItem,
      saveCreatedItem,
      deleteItem,
      updateItem,
      uploadItem,
      setActivePage,
      onToast,
    ],
  );

  return (
    <StudyContext.Provider value={contextValue}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider.");
  }
  return context;
}
