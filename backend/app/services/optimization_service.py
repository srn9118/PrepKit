"""Optimization service for calculating cheapest shopping list distribution"""

from sqlalchemy.orm import Session
from app.services import price_service
from app.schemas.meal_plan import ShoppingListItem
from typing import List, Dict, Optional
from decimal import Decimal
from collections import defaultdict


class OptimizedShoppingListItem:
    """Optimized shopping list item with price information"""
    def __init__(
        self,
        ingredient_id: int,
        ingredient_name: str,
        total_amount: float,
        unit: str,
        cheapest_price: Optional[Decimal] = None,
        cheapest_supermarket: Optional[str] = None,
        cheapest_supermarket_id: Optional[int] = None,
        total_cost: Optional[Decimal] = None
    ):
        self.ingredient_id = ingredient_id
        self.ingredient_name = ingredient_name
        self.total_amount = total_amount
        self.unit = unit
        self.cheapest_price = cheapest_price
        self.cheapest_supermarket = cheapest_supermarket
        self.cheapest_supermarket_id = cheapest_supermarket_id
        self.total_cost = total_cost


class SupermarketTotal:
    """Total cost for a supermarket"""
    def __init__(
        self,
        supermarket_id: int,
        supermarket_name: str,
        total_price: Decimal,
        item_count: int
    ):
        self.supermarket_id = supermarket_id
        self.supermarket_name = supermarket_name
        self.total_price = total_price
        self.item_count = item_count


class OptimizedShoppingListResponse:
    """Complete optimized shopping list response"""
    def __init__(
        self,
        items: List[OptimizedShoppingListItem],
        supermarket_totals: List[SupermarketTotal],
        total_optimized: Decimal,
        recommended_distribution: str,
        total_items: int,
        items_with_prices: int,
        potential_savings: Optional[str] = None
    ):
        self.items = items
        self.supermarket_totals = supermarket_totals
        self.total_optimized = total_optimized
        self.recommended_distribution = recommended_distribution
        self.total_items = total_items
        self.items_with_prices = items_with_prices
        self.potential_savings = potential_savings


def optimize_shopping_list(
    db: Session,
    shopping_list: List[ShoppingListItem],
    user_id: int
) -> OptimizedShoppingListResponse:
    """
    Optimize shopping list by finding cheapest prices for each ingredient
    
    Algorithm:
    1. For each ingredient in shopping list:
       - Get all available prices (excluding user's exclusions)
       - Find cheapest price
       - Calculate total cost for that ingredient
    2. Group by supermarket
    3. Calculate totals per supermarket
    4. Generate recommendation
    """
    
    optimized_items: List[OptimizedShoppingListItem] = []
    supermarket_costs: Dict[int, Dict] = defaultdict(lambda: {"total": Decimal(0), "count": 0, "name": ""})
    items_with_prices = 0
    
    # Step 1: Find cheapest price for each ingredient
    for item in shopping_list:
        cheapest = price_service.get_cheapest_price_for_ingredient(
            db,
            item.ingredient_id,
            user_id
        )
        
        if cheapest:
            # Calculate total cost for this ingredient
            total_cost = Decimal(str(item.total_amount)) * cheapest.price_per_unit
            
            optimized_items.append(OptimizedShoppingListItem(
                ingredient_id=item.ingredient_id,
                ingredient_name=item.ingredient_name,
                total_amount=item.total_amount,
                unit=item.unit,
                cheapest_price=cheapest.price_per_unit,
                cheapest_supermarket=cheapest.supermarket_name,
                cheapest_supermarket_id=cheapest.supermarket_id,
                total_cost=total_cost
            ))
            
            # Accumulate supermarket costs
            supermarket_costs[cheapest.supermarket_id]["total"] += total_cost
            supermarket_costs[cheapest.supermarket_id]["count"] += 1
            supermarket_costs[cheapest.supermarket_id]["name"] = cheapest.supermarket_name
            items_with_prices += 1
        else:
            # No price available for this ingredient
            optimized_items.append(OptimizedShoppingListItem(
                ingredient_id=item.ingredient_id,
                ingredient_name=item.ingredient_name,
                total_amount=item.total_amount,
                unit=item.unit,
                cheapest_price=None,
                cheapest_supermarket=None,
                cheapest_supermarket_id=None,
                total_cost=None
            ))
    
    # Step 2: Create supermarket totals
    supermarket_totals: List[SupermarketTotal] = []
    total_optimized = Decimal(0)
    
    for supermarket_id, data in supermarket_costs.items():
        supermarket_totals.append(SupermarketTotal(
            supermarket_id=supermarket_id,
            supermarket_name=data["name"],
            total_price=data["total"],
            item_count=data["count"]
        ))
        total_optimized += data["total"]
    
    # Sort by total price (descending)
    supermarket_totals.sort(key=lambda x: x.total_price, reverse=True)
    
    # Step 3: Generate recommendation
    recommendation = _generate_recommendation(supermarket_totals, len(shopping_list), items_with_prices)
    
    # Step 4: Calculate potential savings (if applicable)
    # For now, we just show optimization benefit
    potential_savings = None
    if items_with_prices > 0:
        potential_savings = f"optimized {items_with_prices}/{len(shopping_list)} items"
    
    return OptimizedShoppingListResponse(
        items=optimized_items,
        supermarket_totals=supermarket_totals,
        total_optimized=total_optimized,
        recommended_distribution=recommendation,
        total_items=len(shopping_list),
        items_with_prices=items_with_prices,
        potential_savings=potential_savings
    )


def _generate_recommendation(
    supermarket_totals: List[SupermarketTotal],
    total_items: int,
    items_with_prices: int
) -> str:
    """
    Generate a human-readable recommendation for shopping distribution
    """
    if not supermarket_totals:
        return "No prices available. Please add prices to get recommendations."
    
    if len(supermarket_totals) == 1:
        s = supermarket_totals[0]
        return f"💰 Buy all {s.item_count} items at {s.supermarket_name} for €{s.total_price:.2f}"
    
    # Multi-supermarket recommendation
    top_two = supermarket_totals[:2]
    
    if len(supermarket_totals) == 2:
        return (
            f"💡 Best option: Buy {top_two[0].item_count} items at {top_two[0].supermarket_name} (€{top_two[0].total_price:.2f}) "
            f"and {top_two[1].item_count} items at {top_two[1].supermarket_name} (€{top_two[1].total_price:.2f})"
        )
    
    # 3+ supermarkets
    others_count = sum(s.item_count for s in supermarket_totals[2:])
    others_total = sum(s.total_price for s in supermarket_totals[2:])
    
    return (
        f"💡 Recommended: Buy {top_two[0].item_count} items at {top_two[0].supermarket_name} (€{top_two[0].total_price:.2f}), "
        f"{top_two[1].item_count} at {top_two[1].supermarket_name} (€{top_two[1].total_price:.2f}), "
        f"and {others_count} items at other supermarkets (€{others_total:.2f})"
    )
