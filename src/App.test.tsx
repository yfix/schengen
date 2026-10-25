import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the calendar and counts a clicked day', async () => {
    const { container } = render(<App />);
    expect(screen.getByText('Days in Schengen')).toBeInTheDocument();
    const today = container.querySelector('.Day-Today');
    expect(today).not.toBeNull();
    await userEvent.click(today!);
    expect(container.querySelector('.Day-Today.Day-Selected')).not.toBeNull();
  });
});
