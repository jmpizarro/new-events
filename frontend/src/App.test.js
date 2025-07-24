import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/summaries/latest')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ summary: { en: 'hi', es: 'hola' }, startDate: '', endDate: '', eventTypes: [] })
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    });
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders application title', async () => {
  render(<App />);
  const titles = await screen.findAllByText(/Valencia Events/i);
  expect(titles.length).toBeGreaterThan(0);
});
