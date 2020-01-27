/******************************************************************************
 * Copyright © 2013-2015 The Nxt Core Developers.                             *
 *                                                                            *
 * See the AUTHORS.txt, DEVELOPER-AGREEMENT.txt and LICENSE.txt files at      *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Nxt software, including this file, may be copied, modified, propagated,    *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

package nxt;

public interface Fee {

    long getFee(TransactionImpl transaction, Appendix appendage);

    Fee DEFAULT_FEE = new Fee.ConstantFee(Constants.ONE_NXT);

    Fee NONE = new Fee.ConstantFee(0L);

    final class ConstantFee implements Fee {

        private final long fee;

        public ConstantFee(long fee) {
            this.fee = fee;
        }

        @Override
        public long getFee(TransactionImpl transaction, Appendix appendage) {
            return fee;
        }

    }

    abstract class SizeBasedFee implements Fee {

        private final long constantFee;
        private final long feePerKByte;

        public SizeBasedFee(long feePerKByte) {
            this(0, feePerKByte);
        }

        public SizeBasedFee(long constantFee, long feePerKByte) {
            this.constantFee = constantFee;
            this.feePerKByte = feePerKByte;
        }

        // the first 1024 bytes are free
        @Override
        public final long getFee(TransactionImpl transaction, Appendix appendage) {
            return Math.addExact(constantFee, Math.multiplyExact((long) (getSize(transaction, appendage) / 1024), feePerKByte));
        }

        public abstract int getSize(TransactionImpl transaction, Appendix appendage);

    }

}
