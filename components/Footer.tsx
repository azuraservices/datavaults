import { Button } from '@/components/ui/button';

interface FooterProps {
  onAddItem: () => void;
  onAddRandomItem: () => void;
}

export default function Footer({ onAddItem, onAddRandomItem }: FooterProps) {
  return (
    <div className="flex justify-center mt-8 space-x-4">
      <Button onClick={onAddItem}>Aggiungi Nuovo Articolo</Button>
      <Button onClick={onAddRandomItem}>Articolo Casuale</Button>
    </div>
  );
}
