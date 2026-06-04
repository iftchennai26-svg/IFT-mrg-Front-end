import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

export function ProductCard({ product, onAddToCart, onAddToWishlist, isWishlisted }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden group border-muted/60 bg-card/50 backdrop-blur-sm">
        <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.imageUrl || `https://images.unsplash.com/photo-1532298229144-0ee050d9efee?q=80&w=400&h=400&fit=crop`}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 z-20">
            <Button
              variant="secondary"
              size="icon"
              className={`rounded-full bg-background/80 hover:bg-background ${isWishlisted ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onAddToWishlist(product);
              }}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
          {/* Top Left Suggestions */}
          <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-20 pointer-events-none transition-transform duration-300 group-hover:scale-105">
            {product.rating >= 4.7 && (
              <Badge className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:from-amber-600 hover:to-yellow-400 text-slate-950 font-extrabold uppercase py-1 px-2.5 text-[10px] tracking-wide shadow-md shadow-amber-900/10 border border-white/20 rounded-full">
                🏆 Top Rated
              </Badge>
            )}
            {product.rating >= 4.5 && product.rating < 4.7 && product.reviewCount >= 10 && (
              <Badge className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold uppercase py-1 px-2.5 text-[10px] tracking-wide shadow-md shadow-emerald-950/10 border border-white/20 rounded-full">
                🔥 Bestseller
              </Badge>
            )}
          </div>
          {/* Bottom Left Stock Indicators */}
          <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
            {product.stock === 0 ? (
              <Badge variant="destructive" className="text-[9px] font-extrabold uppercase bg-red-600 hover:bg-red-700 text-white py-0.5 px-1.5 shadow">
                ❌ Out of Stock
              </Badge>
            ) : product.stock <= 4 ? (
              <Badge className="text-[9px] font-extrabold uppercase bg-orange-500 hover:bg-orange-600 text-white py-0.5 px-1.5 shadow border-none">
                ⚠️ Low Stock: {product.stock}
              </Badge>
            ) : (
              <Badge className="text-[9px] font-extrabold uppercase bg-emerald-600 hover:bg-emerald-700 text-white py-0.5 px-1.5 shadow border-none">
                ✔️ In Stock
              </Badge>
            )}
          </div>
        </Link>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <span className="font-bold text-primary">₹{product.price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-muted'}`}
              />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({product.reviewCount})</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button 
            className="w-full text-xs h-9" 
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
