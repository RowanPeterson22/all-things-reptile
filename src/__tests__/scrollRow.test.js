import { render, screen, fireEvent, act } from "@testing-library/react";
import ScrollRow from "../components/ScrollRow";

const setSize = (el, { scrollWidth, clientWidth, scrollLeft = 0 }) => {
  Object.defineProperty(el, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(el, "clientWidth", { configurable: true, value: clientWidth });
  Object.defineProperty(el, "scrollLeft", { configurable: true, writable: true, value: scrollLeft });
};

describe("ScrollRow", () => {
  test("no chevrons when everything fits", () => {
    render(<ScrollRow><span>A</span></ScrollRow>);
    expect(screen.queryByLabelText(/scroll for more/)).toBeNull();
    expect(screen.queryByLabelText("Scroll back")).toBeNull();
  });

  test("shows a right chevron when there is more, and a left one after scrolling", () => {
    render(<ScrollRow label="Tabs"><span>A</span><span>B</span></ScrollRow>);
    const row = screen.getByText("A").parentElement;
    setSize(row, { scrollWidth: 600, clientWidth: 300 });
    act(() => { fireEvent.scroll(row); });
    expect(screen.getByLabelText("Tabs: scroll for more")).toBeInTheDocument();
    expect(screen.queryByLabelText("Scroll back")).toBeNull();
    setSize(row, { scrollWidth: 600, clientWidth: 300, scrollLeft: 300 });
    act(() => { fireEvent.scroll(row); });
    expect(screen.getByLabelText("Scroll back")).toBeInTheDocument();
    expect(screen.queryByLabelText("Tabs: scroll for more")).toBeNull();
  });

  test("tapping the chevron scrolls the row", () => {
    render(<ScrollRow><span>A</span></ScrollRow>);
    const row = screen.getByText("A").parentElement;
    setSize(row, { scrollWidth: 600, clientWidth: 300 });
    row.scrollBy = jest.fn();
    act(() => { fireEvent.scroll(row); });
    fireEvent.click(screen.getByLabelText(/scroll for more/));
    expect(row.scrollBy).toHaveBeenCalledWith({ left: 210, behavior: "smooth" });
  });
});
