/* Extra questions (Rapid Fire, exam, daily challenge) and the flashcard deck. Boss-check questions live with each module. */
(function () {
  "use strict";
  const Q = (m, q, o, a, why) => PA.bank.push({ m, q, o, a, why });

  Q("sc-cycle", "Which flow normally moves upstream, from customers back toward suppliers?", ["Finished goods", "Money", "Trucks", "Raw materials"], 1, "Customers pay retailers, retailers pay the brand, the brand pays suppliers. Product moves the other way.");
  Q("sc-cycle", "Configure-to-order laptops: components are stocked, assembly waits for the order. Where is the push/pull boundary?", ["Before components", "Between components and assembly", "At the store shelf", "There isn't one"], 1, "Components are pushed on a forecast; assembly is pulled by the customer's order.");
  Q("sc-cycle", "In SCOR, which process covers trade-ins, faulty units and recycling?", ["Plan", "Make", "Deliver", "Return"], 3, "Return covers reverse flows: returns, repairs, refurbishment, recycling.");

  Q("dp-cycle", "Which of these belongs in the Collaborate step?", ["Removing a duplicate data load", "Marketing confirming a February promotion", "Calculating WAPE", "Publishing to finance"], 1, "Collaboration adds what history can't know: promotions, launches, listings, price changes.");
  Q("dp-cycle", "Earbuds were out of stock for half of a week and sold 400 that week. What should cleaning do?", ["Keep the 400 as is", "Delete the week", "Estimate true demand and tag the week", "Double it automatically"], 2, "Stock-outs censor demand. Estimate what would have sold and tag the week so the model doesn't learn a false low.");
  Q("dp-cycle", "Sales asks for +1,000 units “to be safe”. Where does that protection belong?", ["In the forecast", "In safety stock", "In the finance budget", "Nowhere"], 1, "Keep the forecast an honest estimate. Protection against uncertainty belongs in safety stock, sized from measured variability.");

  Q("sop", "In which S&OP step are demand and supply put into dollars, with scenarios to close the gaps?", ["Portfolio review", "Demand review", "Integrated reconciliation (pre-S&OP)", "Supply review"], 2, "Pre-S&OP reconciles the plans financially and prepares options for the executive meeting.");
  Q("sop", "Who usually brings component lead times and supplier capacity to S&OP?", ["Marketing", "Procurement", "Customer service", "Finance"], 1, "Procurement owns supplier relationships, capacity commitments and component lead times.");
  Q("sop", "What does ATP (available-to-promise) do?", ["Sets the sales target", "Tells order management what quantity and date can be promised to a customer", "Measures forecast accuracy", "Calculates safety stock"], 1, "ATP checks uncommitted supply so customer orders get realistic dates.");

  Q("seasonality", "Month index 0.80 and a deseasonalised baseline of 50k. What's the forecast for that month?", ["40k", "50k", "62.5k", "80k"], 0, "Baseline × index = 50k × 0.80 = 40k.");
  Q("seasonality", "Why is a fixed monthly index a poor fit for Diwali or Easter?", ["They don't affect demand", "They move between weeks or months from year to year", "They are supply events", "They only affect B2B"], 1, "Moving holidays shift dates. Model them as events on their real dates.");
  Q("seasonality", "Seasonal indices across 12 months should average about…", ["0", "0.5", "1.0", "12"], 2, "An index compares each period with an average period, so the indices average 1.00 (they sum to 12 for monthly data).");

  Q("trends", "Feb index 0.78, Mar index 1.02. March sales are only 5% above February. What does that suggest?", ["Strong growth", "Exactly seasonal", "Weaker than the season predicts", "Data error"], 2, "The season alone predicts about +31% (1.02 ÷ 0.78). +5% means underlying demand fell.");
  Q("trends", "What's the simplest way to remove seasonality from a growth headline?", ["Compare with last month", "Compare with the same period last year", "Use a 3-month average", "Ignore December"], 1, "Year-over-year compares the same season, so the seasonal effect cancels out.");
  Q("trends", "Two identical phones: one launches in September, one in March. Which usually sells more in its first 12 months?", ["March", "September", "Same", "Can't say anything"], 1, "A September launch keeps its early high-demand months in the November–December peak.");

  Q("techniques", "Which method is “same month last year”?", ["Naive", "Seasonal naive", "Moving average", "Croston"], 1, "Seasonal naive repeats the value from one season ago.");
  Q("techniques", "Why does seasonal naive under-forecast a growing product?", ["It ignores seasonality", "It copies last year's level and ignores growth", "It uses too high an α", "It's intermittent"], 1, "Last year's value doesn't include a year of growth, so it's biased low.");
  Q("techniques", "Raising α in simple exponential smoothing makes the forecast…", ["Smoother and slower", "React faster to recent actuals", "Seasonal", "Include a trend"], 1, "Higher α gives more weight to the latest actual: faster reaction, more noise.");

  Q("choose", "ADI of 1.1 and CV² of 0.9. Which pattern?", ["Smooth", "Erratic", "Intermittent", "Lumpy"], 1, "Frequent demand (ADI < 1.32) with highly variable sizes (CV² ≥ 0.49) is erratic.");
  Q("choose", "What does FVA tell you about a forecasting step?", ["Its cost", "Whether it improved accuracy versus the step before", "Its bias sign", "The service level"], 1, "Forecast value added compares error before and after a step or override.");
  Q("choose", "Five years out, for a capacity decision, you should forecast…", ["By SKU and week", "At an aggregate level with scenarios", "With Croston", "With naive"], 1, "Long horizons need aggregate trends, scenarios and judgment; SKU detail is noise.");

  Q("accuracy", "Why can MAPE look terrible when the business impact is small?", ["It ignores direction", "Tiny items with big % errors count as much as big items", "It squares errors", "It uses forecasts as the denominator"], 1, "MAPE averages % errors equally; a 400% miss on 2 units dominates.");
  Q("accuracy", "Which metric punishes a few large misses the most?", ["MAE", "WAPE", "RMSE", "Bias"], 2, "RMSE squares the errors before averaging, so large misses dominate.");
  Q("accuracy", "Total-level accuracy is 97%, SKU-level accuracy is 85%. Why the gap?", ["A calculation error", "Errors offset when aggregated", "Bias", "Seasonality"], 1, "Over- and under-forecasts cancel at total level. Decisions at SKU level still face the 15% error.");

  Q("bias", "Common control limits for the tracking signal?", ["±1", "±4", "±10", "±50%"], 1, "A frequent rule of thumb is ±4 (some teams use up to ±6). Beyond that, investigate bias.");
  Q("bias", "Simple exponential smoothing on a steadily growing product tends to produce…", ["No bias", "Positive bias (too high)", "Negative bias (too low)", "Random bias"], 2, "SES has no trend term, so it trails growth: forecasts sit below actuals.");
  Q("bias", "Two forecasts have the same WAPE. One has bias 0%, the other +8%. Which builds excess stock over time?", ["The 0% one", "The +8% one", "Both equally", "Neither"], 1, "Positive bias means consistent over-forecasting; the extra accumulates as inventory.");

  Q("over-under", "Which is a cause of under-forecasting?", ["Promotion double-counted", "Stacked buffers", "Censored demand from stock-outs", "Hype about a launch"], 2, "Stock-outs cap recorded sales, so history understates demand.");
  Q("over-under", "Which is a typical cost of over-forecasting in electronics?", ["Air freight", "Price protection paid to accounts", "Lost shelf space", "Panic orders"], 1, "Excess stock in the channel loses value; brands often compensate accounts for price drops.");
  Q("over-under", "Shortages cost more than excess. Best response?", ["Inflate the forecast by 10%", "Keep the forecast unbiased and raise safety stock or service level", "Ignore it", "Use a seasonal naive model"], 1, "Asymmetric costs belong in the stocking decision (critical ratio, safety stock), not in the forecast.");

  Q("abc", "Items are ranked by cumulative share of value. An item takes the running total from 79% to 86%. With 80/95 cut-offs (classifying on the total after adding the item), it is…", ["A", "B", "C", "Excluded"], 1, "The cumulative total after this item is 86%: above 80%, within 95%, so B.");
  Q("abc", "Which policy fits C items?", ["Weekly consensus forecasting", "Simple min/max with larger, less frequent orders", "Daily cycle counts", "Make-to-order always"], 1, "C items are low value: automate them and spend the time on A items.");
  Q("abc", "Which XYZ class is a steady seller with CoV 0.3?", ["X", "Y", "Z", "C"], 0, "CoV below 0.5 is X (steady) on common cut-offs.");

  Q("levels", "500 units a week ship on a 4-week ocean route. Pipeline (in-transit) stock?", ["125", "504", "2,000", "20,000"], 2, "Pipeline = demand rate × transit time = 500 × 4 = 2,000 (Little's law).");
  Q("levels", "Factories close for 2 weeks; demand is 800 a week. Anticipation stock to build?", ["400", "800", "1,600", "3,200"], 2, "Build ahead to cover the shutdown: 2 × 800 = 1,600.");
  Q("levels", "Turns of 12 a year means roughly how many days of inventory?", ["12", "30", "52", "365"], 1, "DIO = 365 ÷ 12 ≈ 30 days.");

  Q("holding", "A $500 phone with a 24% annual holding rate. Holding cost per month?", ["$2", "$10", "$24", "$120"], 1, "$500 × 24% ÷ 12 = $10 a month.");
  Q("holding", "At the EOQ, what's true?", ["Holding cost is zero", "Ordering cost equals holding cost", "Order size equals annual demand", "Safety stock is zero"], 1, "Total cost is minimised where annual ordering and holding costs are equal.");
  Q("holding", "If the cost per order (S) falls, EOQ…", ["Rises", "Falls", "Stays the same", "Becomes zero"], 1, "EOQ = √(2DS ÷ H); a smaller S gives a smaller EOQ: order smaller, more often.");

  Q("lead-time", "Which usually comes first in a purchase lead time?", ["Customs", "PO processing", "Put-away", "Store delivery"], 1, "The clock starts with processing and sending the order.");
  Q("lead-time", "Switching ocean to air on a hot launch mainly buys…", ["Lower unit cost", "Weeks of time: a later order date and a fresher forecast", "Less safety stock forever", "Better seasonality"], 1, "Air freight shortens transit, so you commit later with better information, at a higher freight cost.");
  Q("lead-time", "Cumulative lead time is…", ["The average of all lead times", "The longest path to build from scratch, through the bill of materials", "Transit time only", "The customer's wait"], 1, "It's the critical path through components, sub-assemblies and final assembly.");

  Q("safety", "Z for a 99% cycle service level?", ["1.28", "1.65", "2.33", "3.09"], 2, "99% → Z ≈ 2.33.");
  Q("safety", "Four warehouses each hold 300 safety stock. Centralise them (independent demand). New safety stock?", ["300", "600", "1,200", "75"], 1, "Square-root law: 300 × √4 = 600, versus 1,200 spread across four.");
  Q("safety", "Which σ should ideally drive safety stock when you forecast?", ["σ of raw demand", "σ of forecast error", "σ of price", "σ of lead time only"], 1, "The forecast explains part of demand variation; the risk left over is the forecast error.");

  Q("rop", "Weekly demand 400, lead time 3 weeks, safety stock 250. Reorder point?", ["650", "1,200", "1,450", "1,650"], 2, "400 × 3 + 250 = 1,450.");
  Q("rop", "Periodic review every 2 weeks with a 3-week lead time: safety stock must cover…", ["2 weeks", "3 weeks", "5 weeks", "1 week"], 2, "With periodic review you're exposed for R + LT = 5 weeks.");
  Q("rop", "A min/max system is the same as…", ["(s, Q)", "(s, S)", "EOQ", "Croston"], 1, "Min = reorder point s; max = order-up-to level S.");

  Q("bullwhip", "Which practice reduces the bullwhip effect?", ["Monthly full-truckload orders only", "Frequent trade promotions", "Sharing point-of-sale data upstream", "Pro-rata allocation to orders"], 2, "Shared sell-through gives every tier the real demand signal.");
  Q("bullwhip", "Why does everyday low pricing (EDLP) calm orders?", ["It raises prices", "It removes the incentive to forward-buy during discounts", "It shortens lead times", "It batches orders"], 1, "Without price swings, buyers order to need rather than stocking up on deals.");
  Q("bullwhip", "In electronics, planning on sell-in alone risks…", ["Ignoring seasonality", "Planning on an amplified signal that includes channel stocking and destocking", "Too much accuracy", "Lower lead times"], 1, "Sell-in includes accounts' own ordering behaviour; sell-through is closer to real demand.");

  /* ---------- flashcards ---------- */
  let n = 0;
  const C = (m, f, b, x) => PA.cards.push({ id: "c" + (++n), m, f, b, x });
  C("sc-cycle", "The five SCOR processes", "Plan, Source, Make, Deliver, Return, with Enable (data, rules, systems) underneath.");
  C("sc-cycle", "The three supply chain flows", "Product flows downstream; money flows upstream; information flows both ways.");
  C("sc-cycle", "Push vs pull", "Push = done on a forecast, before an order. Pull = triggered by a real customer order.");
  C("sc-cycle", "Cash-to-cash cycle", "Days the company's own cash is tied up.", "C2C = DIO + DSO − DPO");
  C("sc-cycle", "The four cycles (cycle view)", "Customer order, replenishment, manufacturing, procurement.");
  C("dp-cycle", "The 6 Cs of demand planning", "Clean, Calculate, Collaborate, Commit, Communicate, Check.");
  C("dp-cycle", "Unconstrained demand", "What customers would buy if supply were unlimited. The demand plan should be unconstrained.");
  C("dp-cycle", "Censored demand", "Recorded sales capped by a stock-out. True demand was higher; estimate it before forecasting.");
  C("dp-cycle", "Forecast value added (FVA)", "Change in error caused by a process step or override. Negative FVA means the step made it worse.", "FVA = error before − error after");
  C("dp-cycle", "Demand sensing", "Updating the next few days or weeks from recent signals (POS, orders) rather than only monthly history.");
  C("sop", "S&OP in one line", "A monthly process where sales, marketing, supply, finance and leadership agree one plan.");
  C("sop", "The five S&OP steps", "Portfolio review → Demand review → Supply review → Integrated reconciliation (pre-S&OP) → Executive S&OP.");
  C("sop", "Supply review", "Tests the consensus demand against capacity, materials and logistics; sizes the gaps.");
  C("sop", "IBP", "Integrated Business Planning: S&OP extended with full financial integration and a longer horizon.");
  C("sop", "Best allocation rule under shortage", "Allocate by sell-through or weeks of supply. It puts stock where it sells and discourages order inflation.");
  C("seasonality", "Seasonal index", "How a period compares with an average period (1.00).", "Index = average of (period ÷ yearly average)");
  C("seasonality", "Deseasonalise", "Divide actual by the index to see underlying demand.", "Actual ÷ index");
  C("seasonality", "Reseasonalise", "Multiply a flat baseline by the index to get that period's forecast.", "Baseline × index");
  C("seasonality", "Seasonality vs cycle", "Seasonality has a fixed calendar period; cycles (economic ups and downs) have irregular length.");
  C("seasonality", "Ratio to moving average", "Index method for trending data: divide each month by a centred 12-month moving average.");
  C("trends", "Decomposition layers", "Level, trend, seasonality, noise (plus events).");
  C("trends", "Additive vs multiplicative", "Additive: seasonal swings fixed in units. Multiplicative: swings grow with the level.");
  C("trends", "Growth or just the season?", "Expected change from season = index(this) ÷ index(last) − 1. Compare the actual change with it, or use year-over-year.");
  C("trends", "Lunar New Year", "Supply-side seasonality: output at many factories, mostly in China, slows or stops for 2–4 weeks around the holiday, so stock is built ahead.");
  C("trends", "Lifecycle × seasonality", "A product's sales = lifecycle curve × seasonal index of the calendar month. Launch timing matters.");
  C("techniques", "Naive forecast", "Next = last actual. The benchmark every method must beat.");
  C("techniques", "Simple exponential smoothing", "Moves the forecast a fraction α toward each new actual. Level only.", "F(t+1) = α·A(t) + (1−α)·F(t)");
  C("techniques", "Holt's method", "Exponential smoothing with level and trend.");
  C("techniques", "Holt-Winters", "Level + trend + seasonal index. Needs two or more seasons of history.");
  C("techniques", "Croston's method", "For intermittent demand: forecasts demand size and the interval between demands separately.");
  C("techniques", "Delphi method", "Anonymous expert rounds with feedback until views converge. Judgment without groupthink.");
  C("choose", "The six questions for choosing a method", "History, pattern, drivers, horizon, scale, cost of error.");
  C("choose", "ADI and CV² cut-offs", "ADI 1.32 and CV² 0.49 split demand into smooth, erratic, intermittent and lumpy (Syntetos-Boylan).");
  C("choose", "Like-item forecasting", "Use the launch curve of a similar past product to forecast a new one.");
  C("choose", "Combination forecasts", "Averaging several reasonable methods often beats picking one; errors partly cancel.");
  C("accuracy", "WAPE", "Total absolute error ÷ total actual. Volume-weighted.", "Σ|F − A| ÷ ΣA");
  C("accuracy", "MAPE weakness", "Each item counts equally, so tiny items with big % errors dominate; breaks when actual = 0.");
  C("accuracy", "RMSE", "Root mean squared error: punishes big misses more.", "√(Σ(F − A)² ÷ n)");
  C("accuracy", "Forecast lag", "How far ahead a forecast was made. Measure accuracy at the lag equal to the supply lead time.");
  C("accuracy", "Accuracy", "The friendly form of WAPE, floored at 0%.", "Accuracy = 1 − WAPE");
  C("bias", "Forecast bias", "Average direction of error. With F − A, positive = over-forecasting.", "Bias = Σ(F − A) ÷ ΣA");
  C("bias", "Tracking signal", "Running sum of errors ÷ MAD. Beyond ±4 (some teams use ±6) suggests bias.", "TS = Σ(F − A) ÷ MAD");
  C("bias", "Noise vs bias", "Noise cancels over time and is covered by safety stock. Bias accumulates.");
  C("bias", "Model-induced bias", "Methods without a trend term (MA, SES) trail growth, producing negative bias.");
  C("over-under", "HOPED (over-forecasting)", "Hype, One-offs left in, Promotions double-counted, Extra buffers stacked, Demand cannibalised but ignored.");
  C("over-under", "SLICE (under-forecasting)", "Sandbagging, Lagging models, Ignored events, Censored demand, Expanded channels missed.");
  C("over-under", "Critical ratio", "The service level to stock to when shortage and excess costs differ.", "CR = Cu ÷ (Cu + Co)");
  C("over-under", "Buffer stacking", "Small buffers added at several levels compound.", "1.05³ ≈ 1.158");
  C("abc", "ABC classification", "Rank items by annual consumption value; A ≈ top 80% of value, B ≈ next 15%, C ≈ last 5%.");
  C("abc", "Annual consumption value", "What an item is worth to you per year.", "ACV = annual units × unit cost");
  C("abc", "XYZ classification", "Predictability by coefficient of variation: X < 0.5, Y 0.5–1.0, Z > 1.0 (common cut-offs).");
  C("abc", "AZ items", "High value and erratic: the items that need the most human judgment.");
  C("levels", "Inventory position", "What you have plus what's coming, minus what you owe.", "IP = on hand + on order − backorders");
  C("levels", "Average inventory", "Cycle stock averages half the order quantity, sitting on top of safety stock.", "Avg ≈ SS + Q ÷ 2");
  C("levels", "Pipeline stock", "Units in transit.", "Pipeline = demand rate × transit time");
  C("levels", "Inventory turns and DIO", "How many times inventory is sold per year, and days on hand.", "Turns = COGS ÷ avg inventory · DIO = 365 ÷ turns");
  C("levels", "Anticipation stock", "Built ahead of a known event: peak season, promotion, factory shutdown.");
  C("holding", "Holding cost components", "Capital, Storage, Service (insurance, taxes, systems), Risk (obsolescence, shrinkage, damage, price erosion).");
  C("holding", "Typical holding rate", "A common rule of thumb is 20–30% of item value per year (estimates range about 15–35%); often higher for electronics.");
  C("holding", "EOQ", "Order size that balances ordering and holding costs.", "EOQ = √(2DS ÷ H)");
  C("holding", "Price protection", "Compensation a brand pays accounts when the price drops on stock they already hold.");
  C("lead-time", "Lead time", "Time from the order decision until goods are available to sell.");
  C("lead-time", "Order date", "Work backwards from when you need it.", "Order date = need date − lead time");
  C("lead-time", "Time fences", "Frozen (inside lead time, locked) → slushy (limited changes) → liquid (free).");
  C("lead-time", "Demand during lead time", "What you'll sell while you wait.", "DDLT = d × LT");
  C("safety", "Safety stock (demand varies)", "Cushion for demand variability during the lead time.", "SS = Z × σd × √LT");
  C("safety", "Safety stock (demand and lead time vary)", "Adds the lead-time variability term.", "SS = Z × √(LT·σd² + d²·σLT²)");
  C("safety", "Z values", "90% 1.28 · 95% 1.65 · 97.5% 1.96 · 98% 2.05 · 99% 2.33 · 99.9% 3.09");
  C("safety", "Cycle service level vs fill rate", "CSL = probability of no stock-out per cycle. Fill rate = % of demand served from stock.");
  C("safety", "Square-root law", "Pooling n independent locations cuts total safety stock by about √n.");
  C("rop", "Reorder point", "Inventory level that triggers an order.", "ROP = d × LT + SS");
  C("rop", "Order-up-to level (periodic review)", "Covers R + LT.", "S = d(R + LT) + Z·σd·√(R + LT)");
  C("rop", "Two-bin system", "When bin one empties, reorder and use bin two (sized to the reorder point).");
  C("bullwhip", "Bullwhip effect", "Order variability grows as you move upstream from consumers to suppliers.");
  C("bullwhip", "Four causes (Lee et al., 1997)", "Demand signal processing, order batching, price fluctuations, rationing and shortage gaming.");
  C("bullwhip", "Bullwhip fixes", "Share sell-through, count the pipeline, shorten lead times, order small and often, stable pricing, allocate on sell-through.");
  C("bullwhip", "Beer Game", "MIT's supply chain simulation, developed around 1960, that recreates the bullwhip effect.");
})();
