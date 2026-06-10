import { StoreGrid } from '../components/store/StoreGrid';
import { StripeCheckoutButton } from '../components/store/StripeCheckoutButton';

const STRIPE_PACKS = [
  { packId: 'shadow_set', label: 'Shadow Set', price: '$1.00', desc: 'Dark armour skin for all 4 slots' },
  { packId: 'celestial_set', label: 'Celestial Set', price: '$2.00', desc: 'Glowing angelic skin for all 4 slots' },
  { packId: 'dragon_set', label: 'Dragon Set', price: '$3.00', desc: 'Full dragon warrior + exclusive title badge' },
  { packId: 'starter_bundle', label: 'Starter Bundle', price: '$3.00', desc: '3 random epic items + 500 gold' },
];

export default function StorePage() {
  return (
    <div className="space-y-8">
      <section>
        <StoreGrid />
      </section>

      <section>
        <h2 className="text-xl font-display text-accent-gold mb-4">Premium Packs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRIPE_PACKS.map((pack) => (
            <div key={pack.packId} className="card-hover">
              <h3 className="font-display text-text-primary text-lg mb-1">{pack.label}</h3>
              <p className="text-sm text-text-muted mb-3">{pack.desc}</p>
              <StripeCheckoutButton packId={pack.packId} label="Purchase" price={pack.price} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
